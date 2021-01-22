# Features

- Creates comment with short report on cypress gets failures.
- Removes comment when no failures reported.
- Replaces comment everytime build is completed.

## Usage

Assumes you have added `mochawesome` reporter to `cypress.json` which generates JSON reporter file:

```json
  "reporter": "cypress-multi-reporters",
  "reporterOptions": {
    "reporterEnabled": "mochawesome",
    "mochawesomeReporterOptions": {
      "reportDir": "test/cypress/reports/mocha",
      "quiet": true,
      "overwrite": false,
      "html": false,
      "json": true
    }
  }
```

You can now consume the action by referencing the v1 branch:

```yaml
- name: Prepare reports
  if: always()
  run: |
    cd frontend
    npm i -g mochawesome-merge
    npm i -g mochawesome-report-generator
    mochawesome-merge test/cypress/reports/mocha/*.json > ./test/cypress/reports/mocha/index.json
    marge --charts=true --showPassed=false -o ./test/cypress/reports/mocha/ ./test/cypress/reports/mocha/index.json
- name: Cypress report
  uses: dmitry/cypress-report-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    pathname: frontend/test/cypress/reports/mocha/index.json
  if: always()
```
