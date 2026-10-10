# Contributing to Health Matters

Thank you for your interest in contributing to Health Matters. This is a
hackathon prototype for patient-controlled medical record continuity, and
contributions of all sizes are welcome: code, documentation, bug reports,
design feedback, and test cases.

By participating, you agree to follow our
[Code of Conduct](CODE_OF_CONDUCT.md).

## The most important rule: synthetic data only

Health Matters is **not** approved for real patient data.

- Never commit, upload, paste, or attach real medical records, real patient
  names, real identifiers, or any information about a real person's health.
- Use only fictional documents and clearly synthetic test users.
- Do not include real patient data in issues, pull requests, screenshots,
  logs, or test fixtures.

If you accidentally share real personal or medical information, tell a
maintainer immediately so it can be removed from the repository history.

## Never commit secrets

Do not commit access tokens, passwords, API keys, Supabase service-role or
secret keys, HMAC signing keys, or any other credentials.

- Keep secrets in environment files that are listed in `.gitignore`.
- Never place privileged keys in React code or in Vite environment variables
  (anything prefixed `VITE_` is exposed to the browser).
- If you suspect a secret has been exposed, rotate it right away and notify a
  maintainer.

## Ways to contribute

- **Report a bug:** open an issue with clear steps to reproduce it.
- **Suggest an improvement:** open an issue describing the problem and your
  proposed solution.
- **Improve documentation:** fix unclear wording, add examples, or correct
  mistakes.
- **Write code or tests:** pick an open issue or propose a change.
- **Review:** read open pull requests and leave constructive feedback.

For anything larger than a small fix, please open an issue first so we can
discuss the approach before you invest time.

## Reporting security issues

Please do **not** open a public issue for a security vulnerability. Contact a
maintainer privately with a description of the problem and how to reproduce it.
Do not include real patient data in your report.

## Getting started

1. Fork the repository and clone your fork.
2. Create a branch from `main` with a descriptive name:
   - `feature/short-description`
   - `fix/short-description`
   - `docs/short-description`
3. Install dependencies and start the app following the setup notes in the
   [README](README.md) and any project-specific scripts.
4. Make your changes in small, focused commits.
5. Test your changes using synthetic data.
6. Push your branch and open a pull request.

## Development guidelines

### General

- Keep changes focused. One pull request should address one concern.
- Follow the existing code style and project structure.
- Write clear, descriptive commit messages in the imperative mood, for example
  `Add expiry check to sharing grant lookup`.
- Add or update tests when you change behavior.
- Update documentation when your change affects how the project is used.

### Project principles

Changes should respect the design principles described in the README:

- **Human review comes first.** AI-extracted output must never be
  automatically marked `patient_confirmed` or `integrity_signed`.
- **The patient stays in control.** Sharing must be time-limited and
  revocable, and QR codes must contain only an opaque token, never medical
  information.
- **Authorization is enforced server-side.** A submitted patient ID is not
  proof of ownership. Verify the authenticated user on the server.
- **Original documents stay private.** Keep the storage bucket private and do
  not expose public storage URLs.
- **Failures must be honest.** Failed processing or failed database writes
  must never return a false success response.
- **Integrity checks have clear limits.** A valid signature does not prove
  clinical accuracy or that the source document is authentic. Do not describe
  it as if it does.

### Claims and wording

Please be careful with how features are described, in code comments, the UI,
the documentation, and demos.

- Do not claim HIPAA compliance, FHIR compliance, or hospital
  interoperability.
- Do not describe sharing, signing, or verification as finished unless they are
  built and tested.
- Do not suggest that the application diagnoses conditions, replaces
  clinicians, or verifies a doctor's identity.
- Label simulated doctor access clearly as a demo.

### Logging and privacy

- Avoid logging authorization headers, document contents, or extracted medical
  data.
- Redact sharing tokens from logs.
- Avoid adding third-party scripts to pages that display shared records.

## Pull request checklist

Before you submit a pull request, confirm that:

- [ ] The change is focused and the description explains what and why.
- [ ] It links to the related issue, if there is one.
- [ ] No real patient data is included anywhere.
- [ ] No secrets, tokens, or keys are committed.
- [ ] Tests were added or updated, and they pass.
- [ ] Documentation was updated where needed.
- [ ] The change does not weaken any authorization, privacy, or integrity
      control.
- [ ] Any new claim about functionality is accurate and clearly marked as
      implemented, tested, or planned.

## Review process

A maintainer will review your pull request as soon as they can. You may be
asked to make changes. Reviews are meant to improve the project, so please keep
discussion respectful and focused on the work. Once approved, a maintainer will
merge your pull request.

## Questions

If you are unsure about anything, open an issue and ask. Questions are welcome.

Thank you for helping make medical information easier to carry and understand.
