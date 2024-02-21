import bodyParser from 'body-parser';
import express from 'express';
import routes from './routes';
import { RedisStorage } from './util/Storage';

const storage = new RedisStorage();
storage.connect();
const app = express();

app.use('/', express.static('./public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

app.use('/', routes);

var server = app.listen(3001, function() {
    console.log('Express server has started on port 3001')
});
