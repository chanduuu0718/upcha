# Automation

Workflow orchestration for the Upcha pipeline.

Planned workers:

- `product-selector/`
- `link-converter/`
- `pin-generator/`
- `publisher/`
- `scheduler/`

Each worker should expose a small, testable job boundary and report success/failure state to the job queue.
