/*--------------------------------------------------------------
>>> UNBLOB
----------------------------------------------------------------
# Global variable
# Mutations
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var unblob = {
	mutations: {},
	media_sources: {}
};


/*--------------------------------------------------------------
# MUTATIONS
--------------------------------------------------------------*/

unblob.mutate = function (target, callback) {
	return (function (original) {
		return function () {
			callback(arguments, original);

			return original.apply(this, arguments);
		};
	}(target));
};

unblob.mutations.promiseThen = function () {
	Promise.prototype.then = (function (original) {
		return function () {
			if (this._unblob === 'fetch') {
				for (var i = 0, l = arguments.length; i < l; i++) {
					/*arguments[i] = unblob.mutate(arguments[i], function (arguments, original) {
						var argument = arguments[0];

						console.log('Promise.then->Function', argument);

						if (
							argument instanceof Response &&
							argument.body instanceof ReadableStream
						) {
							argument.body._unblob = argument.url;

							console.log('ReadableStream', argument.body);
						}
					});*/
				}
			}

			var result = original.apply(this, arguments);

			//console.log('Promise.then', result, arguments);

			return result;
		};
	}(Promise.prototype.then));
};

unblob.mutations.responseArrayBuffer = function () {
	Response.prototype.arrayBuffer = (function (original) {
		return function () {
			var result = original.apply(this, arguments);

			result.then(function (response) {
				response._unblob = 'hello-world'
				//console.log('Response.arrayBuffer', response);
			});

			//console.log('responseArrayBuffer', result, arguments);

			return result;
		};
	}(Response.prototype.arrayBuffer));
};

unblob.mutations.MediaSource = function () {
	MediaSource = (function (original) {
		var object = function () {
			var result = new original;

			for (var key in original) {
				result[key] = original[key];
			}

			result.prototype = original.prototype;

			console.log('MediaSource', result);

			result.addSourceBuffer = (function (original) {
				return function () {
					var result = original.apply(this, arguments);

					console.log('MediaSource.addSourceBuffer', result);

					result.appendBuffer = (function (original) {
						return function () {
							var result = original.apply(this, arguments);

							this._unblob = arguments[0]._unblob;

							//console.log('SourceBuffer.appendBuffer', arguments[0]);

							return result;
						};
					}(result.appendBuffer));

					return result;
				};
			}(result.addSourceBuffer));

			return result;
		};

		for (var key in original) {
			object[key] = original[key];
		}

		object.prototype = original.prototype;

		return object;
	}(MediaSource));
};

unblob.mutations.createObjectURL = function () {
	URL.createObjectURL = (function (original) {
		return function () {
			var result = original.apply(this, arguments);

			if (arguments[0] instanceof MediaSource) {
				console.log('URL.createObjectURL', result, arguments[0]);

				unblob.media_sources[result] = arguments[0];
			}

			return result;
		};
	}(URL.createObjectURL));
};

unblob.mutations.ReadableStreamGetReader = function () {
	ReadableStream.prototype.getReader = (function (original) {
		var object = function () {
			var result = original.apply(this, arguments);

			//console.log('ReadableStream.getReader', result, arguments);

			return result;
		};

		for (var key in original) {
			object[key] = original[key];
		}

		object.prototype = original.prototype;

		return object;
	}(ReadableStream.prototype.getReader));
};

unblob.mutations.XMLHttpRequest = function () {
	XMLHttpRequest = (function (original) {
		var object = function () {
			var result = new original;

			result.addEventListener('load', function (event) {
				if (this.response instanceof ArrayBuffer) {
					console.log(this.response);
					this.response._unblob = this.responseURL;
				}
			}, true);

			return result;
		};

		for (var key in original) {
			object[key] = original[key];
		}

		object.prototype = original.prototype;

		return object;
	}(XMLHttpRequest));
};

unblob.mutations.fetch = function () {
	fetch = (function (original) {
		var self = this,
			object = async function () {
				var result = original.apply(this, arguments);

				result._unblob = 'fetch';

				/*result.then(function (response) {
					//console.log('fetch', response);
				});*/

				return result;
			};

		for (var key in original) {
			object[key] = original[key];
		}

		object.prototype = original.prototype;

		return object;
	}(fetch));
};

unblob.mutations.Uint8Array = function () {
	Uint8Array = (function (original) {
		var object = function (buffer, byteOffset, length) {
			var result = new original(buffer, byteOffset, length);

			if (buffer instanceof ArrayBuffer) {
				//console.log('Uint8Array', buffer, '>', result);

				result._unblob = buffer._unblob;
			}

			return result;
		};

		for (var key in original) {
			object[key] = original[key];
		}

		object.prototype = original.prototype;

		return object;
	}(Uint8Array));
};


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

unblob.mutations.promiseThen();
unblob.mutations.responseArrayBuffer();
unblob.mutations.MediaSource();
unblob.mutations.createObjectURL();
unblob.mutations.XMLHttpRequest();
unblob.mutations.fetch();
unblob.mutations.Uint8Array();
unblob.mutations.ReadableStreamGetReader();

window.addEventListener('unblob', function (event) {
	var media = unblob.media_sources[event.detail],
		buffer = media.activeSourceBuffers[media.activeSourceBuffers.length - 1],
		url = buffer._unblob;

	console.log(url);

	if (location.hostname.indexOf('youtube.com') !== -1) {
		url = url.replace(/(range=[^&]+&?||rn=[^&]+&?||rbuf=[^&]+&?)/g, '');
	}

	window.open(url, '_blank');
});