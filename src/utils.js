const core = require('@actions/core')
const github = require('@actions/github')
const markdownTable = require('markdown-table')
const {replaceComment, deleteComment} = require('@aki77/actions-replace-comment')

function getExamples(results) {
  return getChildren(results, [])
}

function getChildren(input, output) {
  Object.values(input).forEach(({tests, suites}) => {
    if (tests) {
      tests.forEach(({fail, pending, skipped, fullTitle, err: {message}}) => {
        if (fail || pending || skipped) {
          output.push({
            fullTitle,
            message,
            state: fail ? 'fail' : (skipped ? 'skipped' : 'pending')
          })
        }
      })
    }

    if (suites) {
      output = [...getChildren(suites, output)]
    }
  })

  return output
}

function getTable(examples) {
  return markdownTable([
    ['State', 'Title', 'Description'],
    ...examples.map(({state, fullTitle, message}) => [
      state,
      fullTitle,
      message.replace(/\n+/g, ' ')
    ])
  ])
}

function getSummary(stats) {
  return `Passes: ${stats.passes},` +
    ` failures: ${stats.failures},` +
    ` pending: ${stats.pending},` +
    ` skipped: ${stats.skipped},` +
    ` other: ${stats.other}.`
}

function pullRequestId() {
  const pullRequestId = github.context.issue.number
  if (!pullRequestId) {
    throw new Error('Cannot find the pull request ID.')
  }
  return pullRequestId
}

const commentGeneralOptions = () => {
  return {
    token: core.getInput('token', {required: true}),
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: pullRequestId()
  }
}

async function report(result) {
  const title = core.getInput('title', {required: true})

  if (result.success) {
    await deleteComment({
      ...commentGeneralOptions(),
      body: title,
      startsWith: true
    })
    return
  }

  await replaceComment({
    ...commentGeneralOptions(),
    body: `${title}
<details>
<summary>${getSummary(result.stats)}</summary>
${getTable(getExamples(result.results))}
</details>
`
  })
}

exports.getTable = getTable
exports.getExamples = getExamples
exports.getSummary = getSummary
exports.report = report
