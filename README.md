#Working in Widener

Working in Widener is an educational game. You assume the role of a shelver working in Harvard's Widener Library. You are assigned five books to shelve and asked to find their places in the stacks using their call numbers. The faster the better.

## Installation

### Node.js

Working in Widener uses [node.js](http://nodejs.org/). Be sure to install it.

If you're on Ubuntu, [this might be helpful](http://apptob.org/)

### Installation with Apache and Node.js

The most straightforward installation of Working in Widener uses Apache to serve up most everything and uses Node.js to handle socket-type communication.

Mosey over to your Apache documents directory and clone the git repo:

    cd /var/www/html
    git clone https://github.com/harvard-lil/working-in-widener.git

Config details are held in config.example.json. Copy that to a local config and edit as needed:
    cp config.example.json

Fire up the node server:
    node server.js

Things should be up now. Point your browser to something like http://yourhost/working-in-widener

### Installation with Node.js

If you want Node.js to serve up your HTML, CSS, and so on, you'll need to edit two things:

 * Add the routes to your files in server.js. [Express](http://expressjs.com/) handles this. See the commented our routes in server.js as examples.
 * Node will server the socket.io client for you. Remove the WEB_SOCKET_SWF_LOCATION line from main.js.
 

## License

Dual licensed under the MIT license (below) and [GPL license](http://www.gnu.org/licenses/gpl-3.0.html).

<small>
MIT License

Copyright (c) 2012 The Harvard Library Innovation Lab

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</small>