check: test

test: test-parser test-core test-incoming test-outgoing \
      test-socket test-upgrade test-server

MOCHA_FLAGS = --require should

test-parser:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/parser/*.js

test-native-parser:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/native-parser/*.js

test-core:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/core/*.js

test-incoming:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/incoming/*.js

test-outgoing:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/outgoing/*.js

test-socket:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/socket/*.js

test-upgrade:
	./node_modules/.bin/mocha \
        $(MOCHA_FLAGS) test/upgrade/*.js

test-server: 
	./node_modules/.bin/mocha \
		$(MOCHA_FLAGS) test/server/*.js
