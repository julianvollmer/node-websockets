check: test

test: test-parser test-socket test-upgrade test-base test-server test-client

MOCHA_FLAGS = --require should

test-parser:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/parser/*.js

test-socket:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/socket/*.js

test-upgrade:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/upgrade/*.js

test-base:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/base/*.js

test-server: 
	./node_modules/.bin/mocha \
		$(MOCHA_FLAGS) test/server/*.js

test-client: 
	./node_modules/.bin/mocha \
		$(MOCHA_FLAGS) test/client/*.js
