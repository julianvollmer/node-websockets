check: test

test: test-core test-base test-frame test-proto

test-core: 
	./node_modules/.bin/mocha \
		test/upgrade.js

test-base:
	./node_modules/.bin/mocha \
        test/base/*.js

test-frame:
	./node_modules/.bin/mocha  \
        test/frame/*.js

test-proto: 
	./node_modules/.bin/mocha \
		test/server.js
