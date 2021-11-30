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

unblob.mutations.createObjectURL = function () {
	URL.createObjectURL = (function (original) {
		return function () {
			var result = original.apply(this, arguments);

			unblob.media_sources[result] = arguments[0];

			//console.log('URL.createObjectURL:', this, arguments);

			return result;
		};
	}(URL.createObjectURL));
};

unblob.mutations.XMLHttpRequest = function () {
	XMLHttpRequest = (function (original) {
		var object = function () {
			var result = new original;

			result.addEventListener('load', function () {
				this.response._unblob = this.responseURL;

				//console.log('XMLHttpRequest:', this.responseURL, this.response);
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

unblob.mutations.Uint8Array = function () {
	Uint8Array = (function (original) {
		var object = function (buffer, byteOffset, length) {
			var result = new original(buffer, byteOffset, length);

			if (buffer instanceof ArrayBuffer) {
				//console.log('Uint8Array:', buffer, '>', result);

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

unblob.mutations.MediaSource = function () {
	MediaSource = (function (original) {
		var object = function () {
			var result = new original;

			for (var key in original) {
				result[key] = original[key];
			}

			result.prototype = original.prototype;

			result.addSourceBuffer = (function (original) {
				return function () {
					var result = original.apply(this, arguments);

					result.appendBuffer = (function (original) {
						return function () {
							var result = original.apply(this, arguments);

							this._unblob = arguments[0]._unblob;

							//console.log('SourceBuffer.appendBuffer:', this, arguments);

							return result;
						};
					}(result.appendBuffer));

					//console.log('MediaSource.addSourceBuffer:', result);

					return result;
				};
			}(result.addSourceBuffer));

			//console.log('MediaSource');

			return result;
		};

		for (var key in original) {
			object[key] = original[key];
		}

		object.prototype = original.prototype;

		return object;
	}(MediaSource));
};

/*unblob.mutations.SourceBuffer = function () {
	SourceBuffer = (function (original) {
		var object = function () {
			var result = new original;

			for (var key in original) {
				result[key] = original[key];
			}

			result.prototype = original.prototype;

			result.appendBuffer = (function (original) {
				return function () {
					var result = original.apply(this, arguments);

					console.log('SourceBuffer.appendBuffer:', this, arguments);

					return result;
				};
			}(result.appendBuffer));

			console.log('SourceBuffer');

			return result;
		};

		for (var key in original) {
			object[key] = original[key];
		}

		object.prototype = original.prototype;

		return object;
	}(SourceBuffer));
};*/

/*unblob.mutations.createElement = function () {
	document.createElement = (function (original) {
		var object = function () {
			var result = original.apply(this, arguments);

			if (
				result &&
				(
					result.nodeName === 'AUDIO' ||
					result.nodeName === 'VIDEO'
				)
			) {
				Object.defineProperty(result, 'currentSrc', {
					get: function () {
						return this._unblobSrc;
					},
					set: function (value) {
						console.log(value);

						this._unblobSrc = value;
					}
				});

				console.log('createElement:', result);
			}

			return result;
		};

		for (var key in original) {
			object[key] = original[key];
		}

		object.prototype = original.prototype;

		return object;
	}(document.createElement));
};*/


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

unblob.mutations.MediaSource();
unblob.mutations.createObjectURL();
unblob.mutations.XMLHttpRequest();
unblob.mutations.Uint8Array();

window.addEventListener('unblob', function (event) {
	var media = unblob.media_sources[event.detail];

	console.log(event.detail, media.activeSourceBuffers[media.activeSourceBuffers.length - 1]._unblob);

	window.open(media.activeSourceBuffers[media.activeSourceBuffers.length - 1]._unblob, '_blank');
});