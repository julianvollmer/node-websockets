check: test

test: test-base test-frame test-socket test-upgrade test-server test-clien test-client

test-base:
	./node_modules/.bin/mocha \
        --require should test/base/*.js

test-frame:
	./node_modules/.bin/mocha  \
        --require should test/frame/*.js

test-socket:
	./node_modules/.bin/mocha \
        --require should test/socket/*.js

test-upgrade:
	./node_modules/.bin/mocha \
        --require should test/upgrade/*.js

test-server: 
	./node_modules/.bin/mocha \
		--require should test/server/*.js

test-client: 
	./node_modules/.bin/mocha \
		--require should test/client/*.js
