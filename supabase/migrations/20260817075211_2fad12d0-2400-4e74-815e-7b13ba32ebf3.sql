-- Roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Cars
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  year INTEGER NOT NULL,
  transmission TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 5,
  fuel TEXT NOT NULL,
  consumption TEXT NOT NULL DEFAULT '',
  mileage_policy TEXT NOT NULL DEFAULT 'Neribotas',
  price_per_day NUMERIC(10,2) NOT NULL,
  cover_image_url TEXT NOT NULL DEFAULT '',
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cars TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views active cars" ON public.cars
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins view all cars" ON public.cars
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage cars" ON public.cars
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bookings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views bookings" ON public.bookings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER cars_touch BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX cars_sort_idx ON public.cars(sort_order, created_at);
CREATE INDEX bookings_car_idx ON public.bookings(car_id);

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Anyone views bookings" ON public.bookings;

CREATE POLICY "Only admins can modify roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE SELECT ON public.bookings FROM anon, authenticated;
GRANT SELECT (car_id, date_from, date_to) ON public.bookings TO anon, authenticated;
GRANT SELECT ON public.bookings TO service_role;

-- Add new columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS total_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pickup_time text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS return_time text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS bookings_touch_updated_at ON public.bookings;
CREATE TRIGGER bookings_touch_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.get_car_booked_dates(_car_id uuid)
RETURNS TABLE(date_from date, date_to date, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT date_from, date_to, status
  FROM public.bookings
  WHERE car_id = _car_id
    AND status <> 'cancelled'
$$;

REVOKE SELECT ON public.bookings FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_car_booked_dates(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_car_booked_dates(uuid) TO anon, authenticated, service_role;

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_number text;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_booking_number_key ON public.bookings(booking_number);

CREATE OR REPLACE FUNCTION public.set_booking_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  yy text := to_char(now(), 'YY');
  next_seq int;
  candidate text;
BEGIN
  IF NEW.booking_number IS NOT NULL AND NEW.booking_number <> '' THEN
    RETURN NEW;
  END IF;

  LOOP
    SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number FROM 5) AS INTEGER)), 0) + 1
      INTO next_seq
      FROM public.bookings
      WHERE booking_number LIKE 'R-' || yy || '%'
        AND SUBSTRING(booking_number FROM 5) ~ '^[0-9]+$';

    IF next_seq < 1 THEN next_seq := 1; END IF;
    candidate := 'R-' || yy || LPAD(next_seq::text, 3, '0');

    BEGIN
      NEW.booking_number := candidate;
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      -- retry
    END;
  END LOOP;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_booking_number ON public.bookings;
CREATE TRIGGER trg_set_booking_number
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.set_booking_number();

ALTER TABLE public.bookings ALTER COLUMN booking_number SET NOT NULL;

REVOKE EXECUTE ON FUNCTION public.set_booking_number() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS customer_address text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pickup_location text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS return_location text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_id_code text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mileage_out integer,
  ADD COLUMN IF NOT EXISTS mileage_in integer;

ALTER FUNCTION public.get_car_booked_dates(uuid) SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.get_car_booked_dates(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_car_booked_dates(uuid) TO service_role;

-- car_investments
CREATE TABLE public.car_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_investments TO authenticated;
GRANT ALL ON public.car_investments TO service_role;
ALTER TABLE public.car_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage car_investments" ON public.car_investments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_car_investments_updated BEFORE UPDATE ON public.car_investments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_car_investments_car ON public.car_investments(car_id);

-- car_maintenance
CREATE TABLE public.car_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  type text NOT NULL,
  due_date date,
  last_done_at date,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (car_id, type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_maintenance TO authenticated;
GRANT ALL ON public.car_maintenance TO service_role;
ALTER TABLE public.car_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage car_maintenance" ON public.car_maintenance
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_car_maintenance_updated BEFORE UPDATE ON public.car_maintenance
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_car_maintenance_car ON public.car_maintenance(car_id);

-- expenses
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'other',
  amount numeric NOT NULL DEFAULT 0,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage expenses" ON public.expenses
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_expenses_car ON public.expenses(car_id);

-- page_views
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL DEFAULT '/',
  session_id text NOT NULL DEFAULT '',
  referrer text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_views TO authenticated;
GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read page_views" ON public.page_views
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_page_views_created ON public.page_views(created_at);
CREATE INDEX idx_page_views_session ON public.page_views(session_id);

ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS mileage_km integer;
ALTER TABLE public.car_investments ADD COLUMN IF NOT EXISTS mileage_km integer;
ALTER TABLE public.car_maintenance ADD COLUMN IF NOT EXISTS due_mileage_km integer;
ALTER TABLE public.car_investments ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'purchase';

CREATE POLICY "Anyone can track" ON public.page_views
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(path) <= 2048
  AND length(session_id) BETWEEN 1 AND 128
  AND length(referrer) <= 2048
  AND length(country) <= 8
  AND length(user_agent) <= 1024
);