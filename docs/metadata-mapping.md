# Metadata Mapping (Dublin Core)

This document describes how the internal Ambedkar Digital Archive schema maps to the standard Dublin Core (DC) metadata format, facilitating interoperability and open knowledge exchange.

## Stable Identifier Scheme

The archive uses a stable, human-readable identifier scheme to reference documents, entities, and events:
- **`AMB-EN-V01`**: English document, Volume 1
- **`AMB-EN-V05-PT1`**: English document, Volume 5, Part 1
- **`AMB-DOC-###`**: Miscellaneous or standalone documents
- **`AMB-EVENT-###`**: Timeline events
- **`AMB-PERSON-###`**: Biographical entities or knowledge graph nodes

## Dublin Core Field Mapping

| Internal Field       | Dublin Core Field | Description |
|----------------------|-------------------|-------------|
| `id`                 | `identifier`      | Stable archival ID (e.g., AMB-EN-V01). |
| `title`              | `title`           | The title of the document or volume. |
| (Implicit)           | `creator`         | "Dr. B. R. Ambedkar" (or specific authors if noted). |
| `published_date`     | `date`            | The original date of publication (if available). |
| `language`           | `language`        | ISO-639 code or language name (e.g., `english`, `marathi`). |
| `document_type`      | `type`            | Type of document (e.g., `volume`, `speech`, `letter`). |
| `source_institution` | `source`          | The institution or original source that provided the material. |
| (Implicit)           | `rights`          | Rights statement (currently `LICENSE_TO_BE_CONFIRMED`). |
| (Derived)            | `description`     | Brief description or metadata summary of the document. |
| (Implicit)           | `format`          | The media type, generally `application/pdf`. |
| `publisher`          | `publisher`       | The entity responsible for making the resource available. |
| `sha256_hash`        | (Custom)          | Cryptographic hash of the file for verification. |

## Open Data Endpoints

The system provides standard endpoints to export metadata:
- `/api/documents/{id}/metadata`: JSON response formatted as Dublin Core.
- `/api/export/documents.json`: Full catalogue in JSON.
- `/api/export/documents.csv`: Full catalogue in UTF-8 (with BOM) CSV format.
