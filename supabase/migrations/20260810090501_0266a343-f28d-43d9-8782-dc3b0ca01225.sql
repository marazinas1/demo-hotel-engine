ALTER TABLE public.property_settings
  ADD COLUMN IF NOT EXISTS invoice_issuer_name text NOT NULL DEFAULT '';

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE RESTRICT,
  invoice_series text NOT NULL DEFAULT '',
  invoice_number integer NOT NULL,
  full_number text NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  currency text NOT NULL DEFAULT 'EUR',
  vat_rate numeric NOT NULL DEFAULT 0,
  is_vat_invoice boolean NOT NULL DEFAULT false,
  seller jsonb NOT NULL,
  buyer jsonb NOT NULL,
  line_items jsonb NOT NULL,
  subtotal_net numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  issued_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX invoices_series_number_idx ON public.invoices (invoice_series, invoice_number);

REVOKE ALL ON public.invoices FROM anon, authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT SELECT ON public.invoices TO authenticated;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read invoices"
ON public.invoices FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.claim_invoice_number()
RETURNS TABLE (series text, number integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_series text;
  v_number integer;
BEGIN
  UPDATE public.property_settings
  SET invoice_next_number = invoice_next_number + 1
  WHERE scope = 'global'
  RETURNING invoice_series, invoice_next_number - 1 INTO v_series, v_number;

  IF v_number IS NULL THEN
    RAISE EXCEPTION 'property_settings (scope=global) eilutė nerasta — bent kartą išsaugokite Sąskaitų nustatymus prieš generuojant pirmą sąskaitą.';
  END IF;

  RETURN QUERY SELECT v_series, v_number;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_invoice_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_invoice_number() TO service_role;