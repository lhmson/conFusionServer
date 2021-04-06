const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("./cors");

var authenticate = require("../authenticate");

const Favorites = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          if (favorites) {
            let user_favorites = favorites.filter(
              (fav) => fav.user._id.toString() === req.user._id.toString()
            )[0];
            if (!user_favorites) {
              var err = new Error("You have no favorites!");
              err.status = 404;
              return next(err);
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(user_favorites);
          } else {
            var err = new Error("There are no favorites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then((favorites) => {
        let user_favorites;
        if (favorites)
          user_favorites = favorites.filter(
            (fav) => fav.user._id.toString() === req.user._id.toString()
          )[0];
        if (!user_favorites)
          user_favorites = new Favorites({ user: req.user._id });
        for (let i of req.body) {
          if (
            user_favorites.dishes.find((dish_id) => {
              if (dish_id._id) {
                return dish_id._id.toString() === i._id.toString();
              }
            })
          )
            continue;
          user_favorites.dishes.push(i._id);
        }
        user_favorites
          .save()
          .then(
            (userFavs) => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(userFavs);
              console.log("Favorites Created");
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          var user_favorites;
          if (favorites) {
            user_favorites = favorites.filter(
              (fav) => fav.user._id.toString() === req.user.id.toString()
            )[0];
          }
          if (user_favorites) {
            user_favorites.remove().then(
              (result) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
              },
              (err) => next(err)
            );
          } else {
            var err = new Error("You do not have any favorites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          if (favorites) {
            const user_favorites = favorites.filter(
              (fav) => fav.user._id.toString() === req.user.id.toString()
            )[0];
            const dish = user_favorites.dishes.filter(
              (dish) => dish.id === req.params.dishId
            )[0];
            if (dish) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            } else {
              var err = new Error("You do not have dish " + req.params.dishId);
              err.status = 404;
              return next(err);
            }
          } else {
            var err = new Error("You do not have any favorites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then((favorites) => {
        var user_favorites;
        if (favorites)
          user_favorites = favorites.filter(
            (fav) => fav.user._id.toString() === req.user.id.toString()
          )[0];
        if (!user_favorites)
          user_favorites = new Favorites({ user: req.user.id });
        if (
          !user_favorites.dishes.find((dish_id) => {
            if (dish_id._id)
              return dish_id._id.toString() === req.params.dishId.toString();
          })
        )
          user_favorites.dishes.push(req.params.dishId);

        user_favorites
          .save()
          .then(
            (userFavs) => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(userFavs);
              console.log("Favorites Created");
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /favorites/:dishId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          var user_favorites;
          if (favorites)
            user_favorites = favorites.filter(
              (fav) => fav.user._id.toString() === req.user.id.toString()
            )[0];
          if (user_favorites) {
            user_favorites.dishes = user_favorites.dishes.filter(
              (dish_id) => dish_id._id.toString() !== req.params.dishId
            );
            user_favorites.save().then(
              (result) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
              },
              (err) => next(err)
            );
          } else {
            var err = new Error("You do not have any favorites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
