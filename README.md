# Rapid Pack N Ship public website

React + TypeScript + Vite public frontend, with a separate website-only FastAPI service. Existing RPS Admin projects are not part of this repository.

- [Static website build, GitHub Release and EC2 operator runbook](docs/deployment/EC2_STATIC_WEBSITE.md)
- [Pre-commit/publication review and approval requirements](docs/deployment/PRE_DEPLOYMENT_REVIEW.md)
- [Frontend implementation and content limitations](frontend/IMPLEMENTATION.md)
- [Website API setup and production prerequisites](backend/README.md)

Use Node 22 and Python 3.9+ for deployment tools (Python 3.11+ for FastAPI). Fresh checkouts need the two approved process videos from the reviewed media release before building; see the runbook. Original private/legacy files remain local and ignored. Never force-add them or deploy the repository root.

No automatic deployment, production credential, EC2 build or Admin API integration is configured. Review and approve source changes and release publication separately.
