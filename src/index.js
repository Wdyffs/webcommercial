import express from 'express';
import markoMiddleware from '@marko/express';
import template from './pages/template.marko';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(markoMiddleware());
app.use('/public', express.static('../dist/assets'))
app.get('/', (req, res) => {
    res.marko(template, {})
})

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    }
    console.log(`Server is listening on ${PORT} port`)
})
