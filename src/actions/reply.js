const { commentIssue } = require( '../github' )

const comment = `Your issue title contains chinese`

function containsChinese(title) {
	return /[\u4e00-\u9fa5]/.test(title)
}

function reply(on) {
	// on( 'issues_opened', ( { payload } ) => {
	// 	const owner = payload.repository.owner.login
	// 	const repo = payload.repository.name
	// 	const number = payload.issue.number
	//
	// 	if (containsChinese(payload.issue.title)) {
	// 		commentIssue( {
	// 			owner, repo, number, body: comment
	// 		} )
	// 	}
	// } )
}

module.exports = reply;
