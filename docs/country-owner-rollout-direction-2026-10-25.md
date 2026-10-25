# Owner-directed India and Pakistan rollout — 25 October 2026

The owner explicitly directed the technical team to revise the internal release check to meet the rollout needs and make the existing India and Pakistan experience available. This is authorization to perform a technical rollout, not a claim of government approval, independent legal or medical review, completed owner testing, or a nonprofit exemption.

The owner previously approved the four English policy versions for publication, requested donor registration from age 18 only, ordinary account registration without a donor-age rule, and blood requests in both countries. Country-separated Firebase rules and local emulator tests are documented in the technical verification report.

For this owner-directed rollout, the existing policy/version/hash, owner direction, database-rules report, country-isolation rule check, and explicit notification-disabled state remain release requirements. A completed real-user end-to-end acceptance report is no longer a *pre-activation* condition; it remains pending and must be recorded after activation. The manifest must continue to say `manualAcceptance: pending-owner-test` and `endToEndTestReport: null` until those tests genuinely occur. Automatic counters and push alerts must not be claimed as live while Cloud Functions are unavailable. Country notification switches remain off.

If live verification finds a privacy, cross-country access, signup, or request-safety failure, turn off the affected country's `settings/countryLaunch` switch, stop the rollout, and investigate before re-enabling it. Public map and roster records remain subject to their independent consent choices.
