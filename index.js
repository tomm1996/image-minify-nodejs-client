//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

const request = require('request');
const path = require('path');
const fs = require('fs');

/**
 * @param opts pass object with api_key and api_host properties
 * to connect to your image_minify_api_server
 * @returns {object} app.compressImage
 */
const nodeImageMinifyApi = (opts) => {
    const app = {
        api_key: '',
        api_host: '',
        _promises: {},
        _num_req: 0,
        /**
         * @param {string} image path to the image that should be sent to the api
         * @returns {Promise}
         */
        compress: function singleImageCompressor(image) {
            return new Promise((resolve, reject) => {
                this._promises[this._num_req] = { resolve, reject };
                if (this._optionsValid()) {
                    this._sendReq(image, this._num_req);
                    this._num_req += 1;
                }
            });
        },

        _optionsValid: function validateOptions() {
            if (!this.api_key) {
                throw new Error('Error! Your API key is not valid');
            }

            if (!this.api_host) {
                throw new Error('Error! Your API host is not valid');
            }

            return true;
        },

        _sendReq: function sendFileToServer(singleFilePath, id) {
            const that = this;
            const filePath = that._reliablePath(singleFilePath);

            request({
                method: 'POST',
                uri: `${that.api_host}/minify`,
                formData: {
                    api_host: that.api_host,
                    api_key: that.api_key,
                    image: fs.createReadStream(filePath),
                },
            }, function req(error, response, body) {
                if (error) {
                    that._promises[id].reject(error);
                } else {
                    if (!JSON.parse(body)) {
                        that._promises[id].reject('Could not parse body');
                    }

                    const res = JSON.parse(body);
                    if (!res.image) {
                        that._promises[id].reject(res);
                        return;
                    }
                    res.image = new Buffer(res.image, 'base64');
                    that._promises[id].resolve(res);
                }
            });
        },
        _reliablePath: function crossPlatformPath(filePath) {
            return path.join(filePath);
        },
    };
    app.api_key = opts.api_key;
    app.api_host = opts.api_host;
    return app;
};

module.exports = nodeImageMinifyApi;
