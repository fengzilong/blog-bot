const GitHub = require( 'github' )

const github = new GitHub( {
	debug: true,
} )

github.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN,
});

console.log( process.env.GITHUB_TOKEN );

const g = module.exports = {
	async commentIssue( { owner, repo, number, body } ) {
		await github.issues.createComment({
			owner,
			repo,
			number,
			body,
		});
	},

	async pathExists( { owner, repo, path } ) {
		try {
			await github.repos.getContent( { owner, repo, path } )
			return true
		} catch( e ) {
			return false
		}
	},

	async getBranchHead( { owner, repo, branch } ) {
		const head = await github.gitdata.getReference( {
			owner,
			repo,
			ref: `heads/${ branch }`
		} )

		return head
	},

	async createCommit( { owner, repo, baseBranch, branch, message, content, path } ) {
		const head = await read( this.getBranchHead( { owner, repo, branch: baseBranch } ) )

		console.log( '>>> base branch head queied' );

		const sha = head.object.sha


		const newTree = await read(
			github.gitdata.createTree( {
				owner,
				repo,
				base_tree: sha,
				tree: [ {
					path,
					content,
					mode: '100644',
					type: 'blob'
				} ],
			} )
		)

		console.log( '>>> newTree created' );

		const commit = await read(
			github.gitdata.createCommit( {
				owner,
				repo,
				message,
				tree: newTree.sha,
				parents: [ sha ]
			} )
		)

		console.log( '>>> commit created' );

		try {
			await read( this.getBranchHead( { owner, repo, branch } ) )
			await github.gitdata.updateReference( {
				owner,
				repo,
				sha: commit.sha,
				ref: 'heads/' + branch,
				force: true
			} )
		} catch ( e ) {
			if ( e.code === 404 ) {
				console.log( '>>> target branch not exist, create' );
				try {
					await github.gitdata.createReference( {
						owner,
						repo,
						sha: commit.sha,
						ref: 'refs/heads/' + branch
					} )
				} catch ( e ) {
					console.log( e );
				}
			}
		}
	},

	async addLabelsToIssue( { owner, repo, number, labels } ) {
		await github.issues.addLabels( { owner, repo, number, labels } );
	},

	deleteBranch() {

	},

	async createPullRequest( { owner, repo, fromBranch, toBranch, title, body } ) {
		try {
			const head = fromBranch
			const base = toBranch

			await github.pullRequests.create( { owner, repo, head, base, title, body } )
		} catch ( e ) {
			if ( e.message.includes( 'already exists' ) ) {
				console.log( '>>> pull request already exists' );
			}
		}
	},

	checkPullRequestMerged() {

	},
}

async function read( api ) {
	const json = await api
	return json.data
}

// g.createCommit( {
// 	owner: 'blog-bot-tests',
// 	repo: 'blog',
// 	baseBranch: 'master',
// 	branch: 'develop',
// 	message: 'commit message',
// 	content: '### title\ntest3',
// 	path: '_posts/created.md'
// } )

// g.createPullRequest( {
// 	owner: 'blog-bot-tests',
// 	repo: 'blog',
// 	fromBranch: 'develop',
// 	toBranch: 'master',
// 	title: 'auto-archiving',
// 	body: 'auto-archiving for issue #1' + '\n\n' + '---\n\nFrom your blog bot 🌈'
// } )
