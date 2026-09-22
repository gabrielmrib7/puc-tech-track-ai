# Design

Use a budget application service that receives an authenticated actor and a Prisma transaction callback. Load the order and budget with ownership predicates, validate pending/WAITING_APPROVAL state, then update all three records in one transaction. Use integer cents or Prisma Decimal consistently, and make concurrent decisions conditional on status PENDING. Expose create/approve/reject handlers and a mobile customer view.
