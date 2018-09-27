var express = require('express');
var router = express.Router();
var sanitizeHtml = require('sanitize-html');
var db = require('../lib/db.js');
var template = require('../lib/template.js');

router.get('/create', function (request, response) {
  db.query('SELECT * FROM author', function (error2, authors) {
    var title = '';
    var description = '';
    var list = template.list(request.list);
    var html = template.HTML(sanitizeHtml(title), list, `
    <form action="/topic/create_process" method="POST">
      <p><input type="text" name="title" placeholder="title"></p>
      <p><textarea name="description" placeholder="description"></textarea></p>
      <p>${template.authorSelect(authors)}</p>
      <p><input type="submit" value="create"></p>
    </form>`, '');
    response.send(html);
  });
});

router.post('/create_process', function (request, response) {
  var post = request.body;
  db.query('INSERT INTO topic(title, description, created, author_id) VALUES(?, ?, NOW(), ?)', [post.title, post.description, post.author], function (error, result) {
    if (error) {
      throw error;
    }
    response.redirect(`/topic/${result.insertId}`);
  });
});

router.get('/update/:pageId', function (request, response) {
  db.query('SELECT * FROM topic WHERE id = ?', [request.params.pageId], function (error, topic) {
    if (error) {
      throw error;
    }
    db.query('SELECT * FROM author', function (error2, authors) {
      if (error2) {
        throw error2;
      }
      var title = topic[0].title;
      var description = topic[0].description;
      var list = template.list(request.list);
      var html = template.HTML(sanitizeHtml(topic[0].title), list, `
      <form action="/topic/update_process" method="POST">
        <input type="hidden" name="id" value=${topic[0].id}>
        <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
        <p><textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea></p>
        <p>${template.authorSelect(authors, topic[0].author_id)}</p>
        <p><input type="submit" value="update"></p>
      </form>`, '');
      response.send(html);
    });
  });
});

router.post('/update_process', function (request, response) {
  var post = request.body;
  db.query('UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?', [post.title, post.description, post.author, post.id], function (error, result) {
    if (error) {
      throw error;
    }
    response.redirect(`/topic/${post.id}`);
  });
});

router.post('/delete_process', function (request, response) {
  var post = request.body;
  db.query('DELETE FROM topic WHERE id = ?', [post.id], function (error, result) {
    if (error) {
      throw error;
    }
    response.redirect('/');
  });
});

router.get('/:pageId', function (request, response, next) {
  db.query('SELECT * FROM topic LEFT OUTER JOIN author ON author.id = topic.author_id WHERE topic.id = ?', [request.params.pageId], function (error, topic) {
    if (error) {
      throw error;
    }
    if (topic.length === 0) {
      next();
    } else {
      var title = topic[0].title;
      var description = topic[0].description;
      var list = template.list(request.list);
      var html = template.HTML(title, list, `
      <h2>${sanitizeHtml(title)}</h2>
      <p>${sanitizeHtml(description)}</p>
      <p>by ${sanitizeHtml(topic[0].name)}</p>`, `
      <a href="/topic/create">create</a>
      <a href="/topic/update/${request.params.pageId}">update</a>
      <form action="/topic/delete_process" method="POST">
        <input type="hidden" name="id" value="${request.params.pageId}">
        <input type="submit" value="delete">
      </form>`);
      response.send(html);
    }
  });
});

module.exports = router;