# Monthly export golden fixture

This fixture proves the Ambiguity Compiler boundary-time demo. The supplied instant is February in UTC and March in `Asia/Kolkata`, so a user-local calendar-month export must include it.

Run `npm run test:golden-fixture` from the project root to execute the deliberately buggy UTC implementation first, then the corrected user-local implementation.
