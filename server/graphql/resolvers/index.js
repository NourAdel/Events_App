const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const user = userID => {
  return User.findById(userID)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

// i want to return the date as string, toISOString does not work
module.exports = {
  events: () => {
    // populate resolves any foriegn keys
    return (
      Event.find()
        // .populate("creator")
        .then(events => {
          return events.map(event => {
            return {
              ...event._doc,
              _id: event._doc._id.toString(),
              date: new Date(event._doc.date).toISOString(),
              creator: user.bind(this, event._doc.creator)
            };
          });
        })
        .catch(err => {
          throw err;
        })
    );
  },
  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5e14c45ccba1b90a9c7def1e"
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          date: new Date(result._doc.date).toISOString(),
          _id: result._doc._id.toString(),
          creator: user.bind(this, result._doc.creator)
        };
        return User.findById("5e14c45ccba1b90a9c7def1e");
      })
      .then(user => {
        if (!user) {
          throw new Error("User does not exist.");
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(result => {
        return createdEvent;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error("User Already exists.");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return { ...result._doc, password: null, _id: result.id };
      })
      .catch(err => {
        throw err;
      });
  }
};
