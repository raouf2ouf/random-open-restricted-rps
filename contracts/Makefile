-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil createGame givePlayerHand 

all: clean remove install update build

# Clean the repo
clean:; forge clean

# Remove modules
remove:; rm -rf lib

install:; forge install foundry-rs/forge-std@v1.5.3 --no-commit && forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Update Dependencies
update:; forge update

build:; forge build

stage:; forge build && cp -f "./out/RestrictedRPSFactory.sol/RestrictedRPSFactory.json" "../frontend/src/contracts/" && cp -f "./out/RestrictedRPSGame.sol/RestrictedRPSGame.json" "../frontend/src/contracts/"

test:; forge test -vvv

coverage:; forge coverage --report debug > coverage-report.txt

snapshot:; forge snapshot

format:; forge fmt

anvil:; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

createGame:; cast send --value 1 $(FACTORY_ADDRESS) "createGame(uint8)" 1 --private-key $(DEFAULT_ANVIL_PRIVATE_KEY)

NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_PRIVATE_KEY) --broadcast -vvvv

ifeq ($(findstring --network lightlink,$(ARGS)),--network lightlink)
	NETWORK_ARGS := --rpc-url $(LIGHTLINK_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast -vvvv
endif

deploy:
	forge script script/RestrictedRPS.s.sol:RestrictedRPSDeploy $(NETWORK_ARGS)