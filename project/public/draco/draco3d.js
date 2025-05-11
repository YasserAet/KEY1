/**
 * @fileoverview Main file for draco3d package.
 */

var createEncoderModule = require('./draco_encoder_nodejs');
var createDecoderModule = require('./draco_decoder_nodejs');

// Fix the GLTFLoader setup
const gltfLoader = useMemo(() => {
  const loader = new GLTFLoader();
  
  // Skip Draco decoder for now to simplify debugging
  // We can add it back once basic loading works
  
  return loader;
}, []);

module.exports = {
  createEncoderModule,
  createDecoderModule
}
