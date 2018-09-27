var express = require('express');
var router = express.Router();
var sanitizeHtml = require('sanitize-html');
var db = require('../lib/db.js');
var template = require('../lib/template.js');

router.post('/create_process', function (request, response) {
  var post = request.body;
  db.query('INSERT INTO author(name, profile) VALUES(?, ?)', [post.name, post.profile], function (error, result) {
    if (error) {
      throw error;
    }
    response.redirect(`/author`);
  });
});

router.get('/update/:pageId', function (request, response) {
  db.query('SELECT * FROM author', function (error, authors) {
    db.query('SELECT * FROM author WHERE id = ?', [request.params.pageId], function (error2, author) {
      var title = '';
      var list = template.list(request.list);
      var html = template.HTML(title, list, `
      ${template.authorTable(authors)}
      <style>
        table {
          border-collapse: collapse;
        }
        thead, tbody {
          border: 1px solid black;
        }
        th, td {
          border: 1px solid black;
        }
      </style>
      <form action="/author/update_process" method="POST">
        <p><input type="hidden" name="id" value="${request.params.pageId}"></p>
        <p><input type="text" name="name" value="${sanitizeHtml(author[0].name)}" placeholder="name"></p>
        <p><textarea name="profile" placeholder="profile">${sanitizeHtml(author[0].profile)}</textarea></p>
        <p><input type="submit" value="update"></p>
      </form>
      `, '');
      response.send(html);
    });
  });
});

router.post('/update_process', function (request, response) {
  var post = request.body;
  db.query('UPDATE author SET name = ?, profile = ? WHERE id = ?', [post.name, post.profile, post.id], function (error, result) {
    if (error) {
      throw error;
    }
    response.redirect(`/author`);
  });
});

router.post('/delete_process', function (request, response) {
  var post = request.body;
  db.query('DELETE FROM topic WHERE author_id = ?', [post.id], function (error1, result) {
    if (error1) {
      throw error1;
    }
    db.query('DELETE FROM author WHERE id = ?', [post.id], function (error2, result) {
      if (error2) {
        throw error2;
      }
      response.redirect(`/author`);
    });
  });
});

router.get('/', function (request, response, next) {
  db.query('SELECT * FROM author', function (error2, authors) {
    var title = '';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
    ${template.authorTable(authors)}
    <style>
      table {
        border-collapse: collapse;
      }
      td {
        border: 1px solid black
      }
    </style>
    <form action="/author/create_process" method="POST">
      <p><input type="text" name="name" placeholder="name"></p>
      <p><textarea name="profile" placeholder="profile"></textarea></p>
      <p><input type="submit" value="create"></p>
    </form>
    `, '');
    response.send(html);
  });
});

module.exports = router;