# Plan: Connect this Lovable project to GitHub for two-way sync

## Goal
Enable the Lovable ↔ GitHub two-way sync so the project code lives in a GitHub repository and future changes can flow in both directions.

## Current state
- The project exists as a TanStack Start placeholder (`src/routes/index.tsx` still shows the blank-page image).
- The local git remote points to Lovable's private storage (`git.private.lovable-gcp.code.storage`), not to GitHub.
- Lovable does not support importing an existing external GitHub repository (such as `dharmastay`).
- Lovable's GitHub sync can only create a new GitHub repository from this project and keep it in sync.

## What this plan will do
1. Guide the project owner to connect the project to GitHub through the Lovable editor UI.
2. After the connection, create a new GitHub repository from this Lovable project.
3. Trigger the initial sync so Lovable pushes the current project code to GitHub.
4. Verify the new GitHub remote appears and the repository contains the latest files.

## Steps

1. **Open the GitHub connect flow in Lovable**
   - In the Lovable editor, click the **Plus (+)** menu in the chat input (bottom left).
   - Choose **GitHub → Connect project**.

2. **Authorize the Lovable GitHub App**
   - Complete the OAuth authorization on GitHub when prompted.

3. **Select the GitHub account or organization**
   - Choose the account/org where the repository should be created.

4. **Create the repository**
   - In Lovable, click **Create Repository** to create the new GitHub repo and push the current project code.

5. **Verify the sync**
   - Confirm the new GitHub repository shows the project files (including `src/routes/index.tsx`, `package.json`, `README.md`, etc.).
   - Confirm that future changes in Lovable commit to GitHub and that changes pushed to GitHub sync back to Lovable.

## What this will NOT do
- It will not pull code from an existing external GitHub repo (e.g., `dharmastay`). If you need that codebase in Lovable, it must be manually rebuilt as a separate project plan.

## Expected outcome
- A new GitHub repository exists containing the current Lovable project.
- Two-way sync is active between Lovable and GitHub.
- The project is no longer only stored in Lovable's private git storage.
