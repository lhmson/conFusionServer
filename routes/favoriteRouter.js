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
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorite) => {
          if (favorite) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          } else {
            var err = new Error("You have no favorites!");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite) {
          favorite = new Favorites({ user: req.user._id });
        }
        for (let i of req.body) {
          if (
            favorite.dishes.find((dish_id) => {
              if (dish_id._id) {
                return dish_id._id.toString() === i._id.toString();
              }
            })
          )
            continue;
          favorite.dishes.push(i._id);
        }
        favorite
          .save()
          .then(
            (userFav) => {
              Favorites.findById(userFav._id)
                .populate("user")
                .populate("dishes")
                .then((userFav) => {
                  res.statusCode = 201;
                  res.setHeader("Content-Type", "application/json");
                  res.json(userFav);
                  console.log("Favorites Created");
                });
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
    Favorites.remove({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
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
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exists: false, favorites: favorites });
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: false, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite) {
          favorite = new Favorites({ user: req.user._id });
        }
        if (
          !favorite.dishes.find((dish_id) => {
            if (dish_id._id)
              return dish_id._id.toString() === req.params.dishId.toString();
          })
        ) {
          favorite.dishes.push(req.params.dishId);
        }
        favorite
          .save()
          .then(
            (userFav) => {
              Favorites.findById(userFav._id)
                .populate("user")
                .populate("dishes")
                .then((userFav) => {
                  res.statusCode = 201;
                  res.setHeader("Content-Type", "application/json");
                  res.json(userFav);
                  console.log("Favorites Created");
                });
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
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite) {
            favorite.dishes = favorite.dishes.filter(
              (dish_id) => dish_id._id.toString() !== req.params.dishId
            );
            favorite.save().then((userFav) => {
              Favorites.findById(userFav._id)
                .populate("user")
                .populate("dishes")
                .then(
                  (result) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(result);
                  },
                  (err) => next(err)
                );
            });
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
