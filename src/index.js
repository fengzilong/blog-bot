const EventEmitter = require( 'events' )
const Koa = require( 'koa' )
const bodyParser = require( 'koa-bodyparser' )
const { verifySignature, getRepo } = require( './utils' )
const archive = require( './actions/archive' )

const app = new Koa()
const githubEvent = new EventEmitter()

app.use( bodyParser() )

app.use( ctx => {
	let eventName = ctx.request.headers[ 'x-github-event' ];
	if ( eventName && verifySignature( ctx.request ) ) {
		const payload = ctx.request.body;
		const action = payload.action;
		eventName += `_${action}`;
		console.log('receive event: ', eventName);
		githubEvent.emit(eventName, {
			repo: getRepo(ctx.request),
			payload,
		});
		ctx.body = 'Ok';
	} else {
		ctx.body = 'Go away';
	}
} );

archive( githubEvent.on.bind( githubEvent ) )

app.listen( 3000 );
console.log( `Listening on http://0.0.0.0:3000` );
