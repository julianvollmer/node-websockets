check: test

test: test-parser test-stream test-incoming \
      test-socket test-upgrade test-server

MOCHA_FLAGS = --require should

test-parser:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/parser/*.js

test-stream:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/stream/*.js

test-incoming:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/incoming/*.js

test-socket:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/socket/*.js

test-upgrade:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/upgrade/*.js

test-server: 
	./node_modules/.bin/mocha \
		$(MOCHA_FLAGS) test/server/*.js
