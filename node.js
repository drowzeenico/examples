var express = require('express');
var router = express.Router();
var _ = require('lodash');

var Calls = require('../models/calls');
var Model = {
  Forecast: require('../models/forecast'),
  Prediction: require('../models/prediction')
};

var calls = new Calls();

/* GET charts. */
router.get('/', (req, res, next) => {
  calls.getProjects().then(projects => {
    return res.render('index', {projects: projects});
  })
});

// общий прогноз по методу хольта
router.post('/:day', (req, res, next) => {
  var graph = {},
      counter = 0,
      points = [],
      forecast = [],
      manual = [],
      interval = req.query.interval || 'day',
      detail = req.query.detail || 'hour',
      finish = req.query.finish || null;

  var projects = Array.isArray(req.body['project[]']) ? req.body['project[]'] : [req.body['project[]']];

  projects.forEach(pid => {
    var Forecast = new Model.Forecast(req.params.day, interval, detail, pid, finish);

    Forecast.getCache().then((isExists) => {
      return Forecast.getPoints();
    })
    .then(data => {
      Forecast.normalizePoints(data);
      var grouped = Forecast.byInterval('points');
      points = Forecast.sum(points, grouped);
      return Forecast.getData();
    })
    .then(data => {
      Forecast.normalizeData(data);
      var grouped = Forecast.byInterval('forecasted');
      forecast = Forecast.sum(forecast, grouped);

      return Forecast.getCorrections(pid);
    })
    .then(data => {
      Forecast.applyCorrections(data);
      var grouped = Forecast.byInterval('manual');
      manual = Forecast.sum(manual, grouped);
      
      counter++;
      Forecast.saveToCache();
      if(counter == projects.length || projects.length == 1)
        return res.json({
          points: points,
          forecast: forecast,
          manual: manual
        });
    })
    .catch(err => {
      console.log(err.stack);
      return res.json({err: err.stack});
    })
  });  
});

// получение всех проектов и их средней длительности
router.get('/durations', (req, res, next) => {
  return res.json(calls.callsDuration);
});

// получение всех проектов и их средней длительности
router.get('/alldurations', (req, res, next) => {
  return res.json({night: calls.night, day: calls.day});
});

// удаление кеша проекта
router.post('/removecache/:project', (req, res, next) => {
  var Forecast = new Model.Forecast(null, null, null, req.params.project);
  Forecast.removeCache();
  var Prediction = new Model.Prediction(null, null, null, req.params.project);
  Prediction.removeCache();
  return res.json({removed: true});
});

module.exports = router;