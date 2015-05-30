/*
 * Never spend hours mining from ground to bedrock again!
 *
 * Learn how to create a simple bot that is capable of digging the block
 * below his feet and then going back up by creating a dirt column to the top.
 *
 * As always, you can send the bot commands using chat messages, and monitor
 * his inventory at any time.
 *
 * Remember that in survival mode he might not have enough dirt to get back up,
 * so be sure to teach him a few more tricks before leaving him alone at night.
 */
var mineflayer = require('../');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node digger.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "digger",
  password: process.argv[5],
  verbose: true,
});

bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  switch(message) {
    case 'list':
      listInventory();
      break;
    case 'dig':
      dig();
      break;
    case 'build':
      build();
      break;
    case 'equip dirt':
      equipDirt();
      break;
  }
});

function listInventory() {
  var id, count, item, idx, slot;
  var output = "";
  for(idx in bot.inventory.slots) {
    slot = bot.inventory.slots[idx];
    if(slot == null) continue;
    count = slot.count;
    id = slot.type;
    item = mineflayer.data.findItemOrBlockById(id);
    if(count) output += item.name + ": " + count + ", ";
  }
  if(!output)
    bot.chat('I have no items');
  else
    bot.chat(output);
}

function dig() {
  if(bot.targetDigBlock) {
    bot.chat("already digging " + bot.targetDigBlock.name);
  } else {
    var target = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if(target && bot.canDigBlock(target)) {
      bot.chat("starting to dig " + target.name);
      bot.dig(target, onDiggingCompleted);
    } else {
      bot.chat("cannot dig");
    }
  }

  function onDiggingCompleted() {
    bot.chat("finished digging " + target.name);
  }
}

function build() {
  var referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  var jumpY = bot.entity.position.y + 1.0;
  bot.setControlState('jump', true);
  bot.on('move', placeIfHighEnough);

  function placeIfHighEnough() {
    if(bot.entity.position.y > jumpY) {
      bot.placeBlock(referenceBlock, mineflayer.vec3(0, 1, 0));
      bot.setControlState('jump', false);
      bot.removeListener('move', placeIfHighEnough);
    }
  }
}

function equipDirt() {
  bot.equip(0x03, 'hand', function(err) {
    if(err) {
      console.error(err.stack);
      bot.chat("unable to equip dirt");
    } else {
      bot.chat("equipped dirt");
    }
  });
}
