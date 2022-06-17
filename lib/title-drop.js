const {getCanvasImage, HorizontalImage, registerFont, UltimateTextToImage, VerticalImage} = require("ultimate-text-to-image")

const titledrop = async (msg, args) => {
  const text = args.join(' ')
  const textToImage = new UltimateTextToImage(text.toUpperCase(), {
    width: 1000,
    height: 600,
    fontFamily: "Arial",
    fontColor: "#FFFFFF",
    fontSize: 100,
    minFontSize: 72,
    lineHeight: 50,
    autoWrapLineHeightMultiplier: 1.2,
    margin: 20,
    marginBottom: 40,
    align: "center",
    valign: "middle",
    backgroundColor: "#000000",
  })
  return msg.channel.createMessage('', {
    file: textToImage.render().toBuffer('image/jpeg'), name: 'titledrop.jpg'
  })
}

module.exports = { titledrop }

//// render the image
// const textToImage = new UltimateTextToImage("Ultimate Text To Image", {
//     width: 400,
//     maxWidth: 1000,
//     maxHeight: 1000,
//     fontFamily: "Arial",
//     fontColor: "#00FF00",
//     fontSize: 72,
//     minFontSize: 10,
//     lineHeight: 50,
//     autoWrapLineHeightMultiplier: 1.2,
//     margin: 20,
//     marginBottom: 40,
//     align: "center",
//     valign: "middle",
//     borderColor: 0xFF000099,
//     borderSize: 2,
//     backgroundColor: "0080FF33",
//     underlineColor: "#00FFFF33",
//     underlineSize: 2,
// });

//// properties
// const width = textToImage.width; // final canvas size
// const height = textToImage.height;  // final canvas size
// const renderedTime = textToImage.renderedTime; // rendering time of canvas
// const measuredParagraph = textToImage.measuredParagraph; // all the details of the texts in size
// const canvas = textToImage.canvas; // the node-canvas
// const hasRendered = textToImage.hasRendered; // a flag to indicate if render() has run

//// render again (this will create a new canvas)
// const options = textToImage.options.fontFamily = "Comic Sans MS";
// const buffer = textToImage.render().toBuffer("image/jpeg");
