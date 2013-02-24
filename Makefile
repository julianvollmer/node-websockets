check: test

test: test-base test-frame test-socket test-upgrade test-server

test-base:
	./node_modules/.bin/mocha \
        test/base/*.js

test-frame:
	./node_modules/.bin/mocha  \
        test/frame/*.js

test-socket:
	./node_modules/.bin/mocha \
        test/socket/*.js

test-upgrade:
	./node_modules/.bin/mocha \
        test/upgrade/*.js

test-server: 
	./node_modules/.bin/mocha \
		test/server/*.js
