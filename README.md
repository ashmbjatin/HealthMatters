# Health Matters — Patient-Controlled Medical Record Continuity

> **Hackathon prototype | Synthetic data only | Not for clinical use**

Health Matters is a HealthTech prototype designed to reduce the information gaps that occur when patients receive care from multiple healthcare providers. It helps patients collect medical documents in one place, turn those documents into a structured timeline, review AI-extracted information, and share selected records through time-limited access.

This repository demonstrates a prototype workflow. It does **not** connect to hospital systems, verify a clinician's identity, establish clinical correctness, or make the system suitable for real patient data.

## 1. Problem statement

Patients often visit different clinics, hospitals, laboratories, and specialists. Their medical information can be scattered across paper prescriptions, PDFs, laboratory reports, scan reports, and separate provider portals.

This fragmentation can lead to:
- Patients repeatedly explaining their medical history or searching for old reports.
- Clinicians having an incomplete picture when earlier records are unavailable.
- Important medication, allergy, test, or treatment details being difficult to locate.
- Patients sharing entire documents when they only need to share relevant information.
- Uncertainty about whether a stored document or extracted record has changed since it was saved.

The core problem is not simply that patients need another document-storage app. It is that medical information is difficult to collect, understand, review, and share across care settings while keeping the patient in control.

## 2. Proposed solution

Health Matters provides a patient-controlled record workflow:

1. **Upload:** The patient uploads a medical document, such as a synthetic prescription or laboratory report.
2. **Secure storage:** The original document is saved in a private Supabase Storage bucket.
3. **AI-assisted extraction:** Gemini extracts structured fields from the document, such as document date, medications, diagnoses explicitly mentioned, allergies, and laboratory results.
4. **Patient review:** The extracted fields are saved as `needs_review`. The patient can inspect and correct them before confirming them.
5. **Structured history:** The application can present reviewed records as an organized medical timeline instead of a collection of unstructured files.
6. **Controlled sharing (planned/separate workflow):** A patient can create a time-limited sharing grant. A QR code contains an opaque access token, not medical information. The server uses the token to look up the authorized record and checks its expiry and revocation state before returning permitted data.
7. **Integrity checking (planned/separate workflow):** A trusted server-side HMAC-SHA256 operation can sign a specific immutable record version. Later, the server can verify that version against the signature.

The aim is to improve continuity and access to information, not to replace doctors, diagnose conditions, or replace official medical-record systems.

## 3. What makes the approach different?

- **Patient-controlled continuity:** The focus is on carrying useful history between care settings, rather than storing files alone.
- **Source-linked information:** The original document remains the source artifact for extracted fields.
- **Human review before confirmation:** AI output is not automatically treated as correct.
- **Temporary sharing:** The design uses expiring and revocable access grants rather than putting medical data inside a QR code.
- **Integrity status with clear limits:** A valid HMAC can show that the signed data matches a particular trusted signature. It does not prove that the source document is authentic, that the clinical content is correct, or that a doctor reviewed it.

## 4. System architecture

### Current ingestion workflow

```text
Patient / Demo Frontend
        |
        | POST request + authenticated session
        v
Ingestion Endpoint: medical/ingest
        |
        v
Validate request and patient identity
        |
        v
Retrieve document from private Supabase Storage
        |
        v
Gemini: extract structured fields
        |
        v
Validate JSON and required field types
        |
        v
Supabase PostgreSQL: save extracted_data
status = needs_review
        |
        v
Return record ID and review status
```

### Planned patient sharing and integrity workflows

```text
Patient reviews extracted fields
        |
        v
Patient confirmation
status = patient_confirmed
        |
        v
Trusted server-side signing operation
status = integrity_signed
        |
        v
Create sharing grant: token hash + record association + expiry
        |
        v
QR contains opaque token only
        |
        v
Doctor demo page -> server validates token, expiry and revocation
        |
        v
Server retrieves authorized record and verifies signature
        |
        v
Return only permitted record data
```

The sharing and signing flow is separate from the ingestion flow. Do not represent it as implemented unless the corresponding workflows and tests have actually been completed.

## 5. Technology stack

- **Frontend:** React + Vite (planned/integrated according to the current application state)
- **Database:** Supabase PostgreSQL
- **Document storage:** Supabase Storage, private bucket named `medical-records`
- **AI extraction:** Google Gemini through the configured Gemini integration
- **Record structure:** JSON stored in the `extracted_data` JSONB field
- **Integrity protection:** HMAC-SHA256, planned as a trusted server-side operation
- **Sharing:** Opaque, expiring, revocable token associated with a server-side sharing grant, planned as a separate workflow

Use "FHIR-inspired JSON" only if describing a simplified data structure influenced by FHIR concepts. This prototype does not claim FHIR compliance or hospital interoperability.

## 6. Run locally

> Use **synthetic documents only**. Never upload real patient records while running or testing this prototype.

### 6.1 Prerequisites

- **Node.js** 20 or newer, and **npm** (check with `node -v` and `npm -v`)
- **Git**
- A **Supabase** project (free tier is fine) with access to its project URL, anon key, and service-role key
- A **Google Gemini API key** (from Google AI Studio)
- A way to run the ingestion endpoint (`medical/ingest`) — see step 6.5
- One or more **synthetic** test documents (for example, a fake prescription or lab report as a PDF or image)

### 6.2 Clone and install

```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
```

### 6.3 Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Used by | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anon (public) key |
| `VITE_INGEST_URL` | Frontend | URL of the `medical/ingest` endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Server / ingestion only | Supabase service-role key. **Never expose to the browser.** |
| `GEMINI_API_KEY` | Server / ingestion only | Gemini API key used for extraction |
| `HMAC_SECRET` | Server only (planned) | Secret for HMAC-SHA256 signing. Only needed once the integrity workflow is built. |

Rules for secrets:
- Only variables prefixed with `VITE_` are bundled into the frontend. Do not put service-role, Gemini, or HMAC secrets in a `VITE_` variable.
- Never commit `.env`. Confirm it is listed in `.gitignore`.

> The variable names above are a suggested convention. Match them to whatever names your code actually reads, and keep `.env.example` in sync.

### 6.4 Set up Supabase

1. **Create a private storage bucket** named `medical-records`. Leave "Public bucket" turned **off**.
2. **Create the records table** with at least: a record ID, the owning patient's user ID, a reference to the stored file, an `extracted_data` column of type `JSONB`, and a `status` column that accepts the values in Section 7.
3. **Enable authentication** (for example, email sign-in) and create a **synthetic test user**. The ingestion endpoint needs a valid session for this user.
4. **Turn on Row Level Security** on the records table and add policies so a patient can only read and write their own rows. Add matching storage policies so a patient can only access their own files.

### 6.5 Run the ingestion endpoint

The ingestion workflow (`medical/ingest`) must be running and reachable from the frontend. It should:
- validate the request and the patient's identity,
- fetch the uploaded file from the private bucket,
- call Gemini for extraction,
- validate the returned JSON, and
- save `extracted_data` with `status = needs_review`.

Start it the way your project hosts it (for example, a local workflow runner or a serverless function), supply `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` as server-side credentials, and set `VITE_INGEST_URL` to its address. Turn off or minimize execution/log retention so document contents and authorization headers are not stored.

### 6.6 Start the frontend

```bash
npm run dev
```

Open the URL Vite prints, usually <http://localhost:5173>.

### 6.7 Verify it works

1. Sign in as your synthetic test user.
2. Upload a synthetic prescription or lab report.
3. Confirm the file appears in the `medical-records` bucket.
4. Confirm a new row exists with `status = needs_review` and populated `extracted_data` (medications, allergies, lab results, and so on).
5. Review the extracted fields in the app. Only after you confirm them should the status move to `patient_confirmed`.

QR sharing, record signing, and verification are planned workflows and will not work yet.

### 6.8 Troubleshooting

- **401 / unauthorized from the ingestion endpoint:** The request needs a valid session token for a real Supabase user. A public URL is not authentication.
- **CORS error in the browser:** Allow your local origin (for example, `http://localhost:5173`) on the ingestion endpoint.
- **File not found in storage:** Check the bucket is named exactly `medical-records` and the storage policies allow the patient's own path.
- **Record stuck in `processing` or set to `error`:** Check the ingestion logs, confirm `GEMINI_API_KEY` is valid, and confirm the document is readable. Records in `error` must not be treated as successfully extracted.
- **Environment variables not picked up:** Restart `npm run dev` after editing `.env`, and make sure frontend variables start with `VITE_`.
- **Port already in use:** Vite will pick the next free port, or run `npm run dev -- --port 3000`.

## 7. Record status definitions

| Status | Meaning |
|---|---|
| `processing` | The ingestion workflow is processing the document. |
| `needs_review` | AI extraction completed and the extracted fields await patient review. |
| `patient_confirmed` | The patient reviewed and confirmed the extracted fields. This is not clinical verification. |
| `integrity_signed` | A trusted server-side operation signed a particular stored record version. |
| `integrity_failed` | An integrity signature check did not pass. This does not, by itself, prove malicious tampering. |
| `error` | Processing failed. The record should not be presented as successfully extracted. |

The workflow must never automatically mark AI output as `patient_confirmed` or `integrity_signed`.

## 8. Security and privacy considerations

This prototype is for demonstration with synthetic data only. Before considering real data, address all of the following:

- **Authorization:** Authenticate each sensitive request and enforce patient ownership server-side. A public endpoint URL and CORS restrictions are not authentication.
- **Secrets:** Keep Supabase service-role/secret keys and any HMAC key in trusted server-side credentials. Never expose them to the browser.
- **Storage:** Keep the bucket private and enforce permitted file access.
- **Logs:** Avoid retaining authorization headers, original document bytes, or extracted medical content in application logs or execution history. Review log retention settings for both successful and failed runs.
- **AI processing:** Documents are sent to the configured AI provider for extraction. Do not use real patient records unless the applicable privacy, security, contractual, and legal requirements have been reviewed.
- **QR sharing:** The QR should contain only an opaque random token. Store a token hash where practical, associate it with the record on the server, enforce expiry and revocation, redact it from logs, and avoid third-party scripts on the sharing page.
- **Integrity checks:** Use a genuine HMAC-SHA256 implementation over a canonical representation of a specific record ID and version. Keep the secret separate from record data and restrict access to signing. A valid signature proves only that the checked content matches the trusted signature; it does not prove clinical accuracy or source authenticity.
- **Doctor demo:** Clearly label simulated doctor access. A demo PIN or frontend toggle does not verify a doctor's professional identity.
- **Clinical safety:** AI-extracted fields require human review. Patient confirmation is not equivalent to clinician verification.
- **Compliance claims:** Do not claim HIPAA compliance, FHIR compliance, or hospital interoperability based only on this prototype.

## 9. Current limitations

- The ingestion workflow may be partially implemented and must be tested with a valid synthetic user, token, and document.
- Caregiver and clinician delegation are outside the initial scope.
- QR sharing, record signing, and verification are separate features and should not be described as finished until built and tested.
- The prototype does not validate the medical correctness of extracted information.
- The prototype is not ready for real patient data or production deployment.

The central message is simple: **Health Matters helps patients carry a more organized, reviewable medical history between care settings, with privacy-aware sharing and integrity checks designed as explicit, testable controls.**

## 10. Demo Video Link:

[HealthMatters_DemoVideo](https://drive.google.com/file/d/1kExHVH-aqJLH9vaX8kuLzChG6qRubxXD/view?usp=sharing)
