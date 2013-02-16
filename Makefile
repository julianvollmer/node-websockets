check: test

test: test-core test-proto

test-core: 
	./node_modules/.bin/mocha \
		test/frame.js \
		test/upgrade.js

test-proto: 
	./node_modules/.bin/mocha \
		test/base.js \
		test/server.js
