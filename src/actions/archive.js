const github = require( '../github' )
const { mentioned } = require( '../utils' )

function handleArchive(on) {
	on( 'issues_opened', async function ( { payload } ) {
		const owner = payload.repository.owner.login
		const repo = payload.repository.name
		const id = payload.issue.id
		const number = payload.issue.number
		const title = 'auto-archiving for issue #' + number
		
		await github.addLabelsToIssue( { owner, repo, number, labels: [ '待归档' ] } )
		await archive( payload )
	} )

	on( 'issue_comment_created', async function ( { payload } ) {
		const comment = payload.comment.body
		if ( mentioned( comment ) ) {
			await archive( payload )
		}
	} )
}

async function archive( payload ) {
	const owner = payload.repository.owner.login
	const repo = payload.repository.name
	const id = payload.issue.id
	const number = payload.issue.number
	const title = 'auto-archiving for issue #' + number

	await github.createCommit( {
		owner,
		repo,
		baseBranch: 'master',
		branch: 'blog-bot-archive-' + id,
		message: title,
		content: payload.issue.body || '',
		path: 'source/_posts/' + payload.issue.title + '.md',
	} )

	await github.createPullRequest( {
		owner,
		repo,
		fromBranch: 'blog-bot-archive-' + id,
		toBranch: 'master',
		title: title,
		body: title + '\n\n' + '---\n\nfrom your blog bot 🌚'
	} )
}

module.exports = handleArchive;
