/**
 *  thinkia
 *  2019.5.8
 *
 **/

   //  what's ia ?

    function Ia() {

        let ia = new Object();

        // eyes
        ia.eyes ={
            mat4:[
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ],
            position:[0,0,0],
            getPos:function () {
                let pos =[]
                pos[0] = ia.eyes.mat4[12];
                pos[1] = ia.eyes.mat4[13];
                pos[2] = ia.eyes.mat4[14];
                return pos;
            },
            euler : {

                order:'ZYX',

                cell:[1,0,0],

            },
            quaternion:[0,0,0,1],
            isOpen : false,

        };

        // view
        ia.view = {
            // mvMat
            mat4:[
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ],
            getPos:function () {
                let pos =[];
                pos[0] = ia.view.mat4[12];
                pos[1] = ia.view.mat4[13];
                pos[2] = ia.view.mat4[14];
                return pos;
            },

            //  mat4 初始朝向
            target:[0,0,-1],

            // mat4旋转信息
            rotateAngle:{

                // 转轴
                axis:'XYZ',

                // 转角
                value:0,

            },

            getCurRotateAngle:function () {

                let normal =[];
                for( let i=0;i<ia.view.target.length;i++)
                {
                    normal[i] = ia.view.target[i];
                }

                let dir = ia.thinkMath.vec3.applyMat4( normal,ia.view.mat4 );
                let ori = ia.thinkMath.vec3.applyMat4( [0,0,0],ia.view.mat4 );

                let curNormal = [ dir[0]-ori[0],dir[1]-ori[1],dir[2]-ori[2]];

                ia.view.rotateAngle.value = ia.thinkMath.vec3.applyVec3( normal,curNormal );

                return ia.view.rotateAngle.value
            }

        };


        // 记录一些常用 着色代码
        ia.colorful={

            curVF:0,

            // 自定义着色
            freeGL:{

                vSrc:'',
                fSrc:'',

            },
            simplePoint:{

                vSrc:`
                               
                    attribute vec4 avPos;
                    attribute vec4 avColor;
                    
                    uniform float uPointSize;
                    
                    uniform mat4 umvMat;
                    uniform mat4 upMat;
            
                    varying highp vec4 vColor;
                  
                    void main() {
                                    
                      gl_Position = upMat * umvMat * avPos;
                      gl_PointSize = uPointSize;
                      vColor = avColor;
                                          
                    }
                    `,

                fSrc:`
             
                    varying highp vec4 vColor;
                    
                    void main() {
                                  
                      gl_FragColor = vColor;
                                         
                    }
                `

            },
            texture:{

                vSrc:`
                
            
                    attribute vec4 avPos;
                    attribute vec2 aTextureCoord;
                
                    uniform mat4 umvMat;
                    uniform mat4 upMat;
                
                    varying highp vec2 vTextureCoord;
                
                    void main(void) {
                    
                    gl_Position = upMat * umvMat * avPos;
                    vTextureCoord = aTextureCoord;
                    
                  
                   
                   }`,

                fSrc:`
                
                    
                    varying highp vec2 vTextureCoord;

                    uniform sampler2D uSampler;
                
                    void main(void) {
                    
                      gl_FragColor = texture2D(uSampler, vTextureCoord);
                
                      
                    }
                `,


            },
            simpleLight:{

                vSrc:`
                    attribute vec4 avPos;
                    attribute vec4 avColor;
                    attribute vec3 avNormal;
                    uniform vec3 uLightColor;
                    uniform vec3 uLightDir;
                    uniform mat4 umvMat;
                    uniform mat4 upMat;
                    varying vec4 vColor;
                
                    void main() {
                        gl_Position = upMat * umvMat * avPos;
                        // 标准化（把长度变为 1 ）
                        vec3 normal = normalize(avNormal);
                        float nDotL = max(dot(uLightDir, normal), 0.0);
                        vec3 diffuse = uLightColor * avColor.rgb * nDotL;
                        vColor = vec4(diffuse, avColor.a);
                    }               
                `,

                fSrc:`          
                    precision mediump float; 
                    varying vec4 vColor;
                    void main() {
                       gl_FragColor = vColor;
                    }           
                `
            },
            useSimplePoint:function( num=2 ){

                ia.colorful.curVF =0;

                // 顶点组   2 --二维组    3--三维组
                ia.world.vAttrib.numComponents = num;

                //rgba
                ia.world.fAttrib.numComponents = 4;

            },
            useTexture:function ( num =3) {

                ia.colorful.curVF =1;

                ia.world.vAttrib.numComponents = num;

                // 纹理坐标
                ia.world.fAttrib.numComponents = 2;

            },
            useSimpleLight:function ( num =3) {

                ia.colorful.curVF =2;

                // 顶点组   2 --二维组    3--三维组
                ia.world.vAttrib.numComponents = num;

                //rgba
                ia.world.fAttrib.numComponents = 4;

            }
        };
        // world
        // 这里是封装常用的webgl绘制方法  直接用于 tutorial
        ia.world={

         render:{
             // 是否指定 canvas 的宽高     默认开启
             initCanvasPx:true,
         },
         programInfo:{},
         gl:{
         },
         expand:{

             // 纹理代码

             helloIaWorldExpand:{
                 texture: function ( texture ) {

                     let gl =ia.world.gl;
                     gl.activeTexture(gl.TEXTURE0);

                     // Bind the texture to texture unit 0
                     gl.bindTexture(gl.TEXTURE_2D, texture);

                     // Tell the shader we bound the texture to texture unit 0
                     gl.uniform1i(ia.world.programInfo.uniformLocations.uSampler, 0);

                     gl.drawElements(gl.TRIANGLES,4,gl.UNSIGNED_SHORT,0);

                 }
             },


         },

         texture:{

             loadTexure:function ( url ,onload=function () {

             } ) {

                 let gl = ia.world.gl;
                 let texture = gl.createTexture();
                 gl.bindTexture(gl.TEXTURE_2D, texture);

                 let level = 0;
                 let internalFormat = gl.RGBA;
                 let width = 1;
                 let height = 1;
                 let border = 0;
                 let srcFormat = gl.RGBA;
                 let srcType = gl.UNSIGNED_BYTE;
                 let pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue


                 gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                     width, height, border, srcFormat, srcType,
                     pixel);

                 let image = new Image();
                 image.onload = function() {
                     gl.bindTexture(gl.TEXTURE_2D, texture);

                     // 翻转 Y 轴
                     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

                     gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                         srcFormat, srcType, image);

                     // 图片的宽高是否为2的指数次幂;
                     if (ia.world.texture.isPowerOf2(image.width) && ia.world.texture.isPowerOf2(image.height)) {

                         gl.generateMipmap(gl.TEXTURE_2D);
                     } else {
                         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                     }

                     onload(texture);
                 };
                 image.src = url;


                return texture;

             },
             // 是否为2的指数次幂
             isPowerOf2:function (value) {

                 return (value & (value - 1)) == 0;
             }

         },
         jsonObj:{
             loadJson:function ( url,onload=function () {
             }) {

                 fetch( url)
                     .then( response => response.json())
                     .then( data =>{

                         onload(data);

                     })
             }
         },
         program:{ },
         canvas:'',
         blend2opacity: function() {
             ia.world.gl.enable(ia.world.gl.BLEND);
             ia.world.gl.blendFunc(ia.world.gl.SRC_ALPHA, ia.world.gl.ONE_MINUS_SRC_ALPHA);
         },
            /**
             *
             * @param needClear    是否清理canvas
             * @param vSrc         顶点着色src
             * @param fSrc         片元着色src
             * @param canvasId
             * @param avPos        顶点坐标
             * @param mvMat        模型视口矩阵
             * @param pMat         投影矩阵
             *
             *
             */
         initIaWorld:function (
             needClear=true,
             complete=function(){
             },

             canvasId='#glcanvas'  ) {

             let vSrc ;
             let fSrc;

             switch ( ia.colorful.curVF ) {
                 case 0:{

                     vSrc = ia.colorful.simplePoint.vSrc;
                     fSrc = ia.colorful.simplePoint.fSrc;
                     break;
                 }
                 case 1:{

                     vSrc = ia.colorful.texture.vSrc;
                     fSrc = ia.colorful.texture.fSrc;
                     break;
                 }

                 case 2:{
                     vSrc = ia.colorful.simpleLight.vSrc;
                     fSrc = ia.colorful.simpleLight.fSrc;
                     break;

                 }

                 default : console.log(' deving ')

             }


             let canvas = document.querySelector(canvasId);



             // inportant!    图片必须指定canvas 大小 ，  否则 图形渲染锯齿感非常严重!!!!!!!!!!!    2019.6.19
              // todo   但是 为什么  不指定canvas 宽高 渲染的模式 会不一样呢？  2109.6.19 thinkia
                if(ia.world.render.initCanvasPx)
                {
                    canvas.width = window.innerWidth
                    canvas.height = window.innerHeight
                }
             // 获取webgl2 上下文
             let gl = canvas.getContext('webgl2');

              // add 2019.10.23
              window.addEventListener( 'resize', onWindowResize, false );
              function onWindowResize(){
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
                canvas.style.width = `${window.innerWidth}px`
                canvas.style.height= `${window.innerHeight}px`
                ia.action.eyes.blink()
                gl.viewport(0, 0,
                  window.innerWidth, window.innerHeight)
              }

             if (!gl) {
                 console.error(' not support webgl2.');
                 return;
             }

             // 保存gl 和 canvas
             ia.world.gl = gl;

             ia.world.canvas=canvas;

             if(needClear)
             {
                 gl.clearColor(0.0, 0.0, 0.0, 1.0);

                 gl.clear(gl.COLOR_BUFFER_BIT);
             }

             // 顶点与片元着色
             let vShader = ia.world.loadShader( gl,gl.VERTEX_SHADER,vSrc );
             let fShader = ia.world.loadShader( gl,gl.FRAGMENT_SHADER,fSrc );

             let shaderProgram = gl.createProgram();
             gl.attachShader( shaderProgram, vShader );
             gl.attachShader( shaderProgram, fShader );
             gl.linkProgram( shaderProgram );

             if(!gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ))
             {
                 console.error(`error: ${gl.getProgramInfoLog( shaderProgram )}` );
                 return ;
             }

             //

             switch ( ia.colorful.curVF ) {
                 // 使用simplePoint 着色
                 case  0:{
                     ia.world.programInfo = {
                         program: shaderProgram,
                         attribLocations: {
                             vertexPosition: gl.getAttribLocation( shaderProgram, 'avPos' ),
                             vertexColor: gl.getAttribLocation(shaderProgram, 'avColor'),
                         },
                         uniformLocations: {
                             projectionMatrix: gl.getUniformLocation( shaderProgram, 'upMat' ),
                             modelViewMatrix: gl.getUniformLocation( shaderProgram, 'umvMat' ),
                         },
                     };

                     break;
                 }

                 // 使用texture着色
                 case 1:{
                     ia.world.programInfo = {
                         program: shaderProgram,
                         attribLocations: {
                             vertexPosition: gl.getAttribLocation(shaderProgram, 'avPos'),
                             textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
                         },
                         uniformLocations: {
                             projectionMatrix: gl.getUniformLocation(shaderProgram, 'upMat'),
                             modelViewMatrix: gl.getUniformLocation(shaderProgram, 'umvMat'),
                             uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
                         },
                     };
                        break;
                 }

                 case 2:{

                     ia.world.programInfo = {
                         program: shaderProgram,
                         attribLocations: {
                             vertexPosition: gl.getAttribLocation( shaderProgram, 'avPos' ),
                             vertexColor: gl.getAttribLocation(shaderProgram, 'avColor'),
                             vertexNormal:gl.getAttribLocation(shaderProgram,'avNormal'),

                         },
                         uniformLocations: {
                             projectionMatrix: gl.getUniformLocation( shaderProgram, 'upMat' ),
                             modelViewMatrix: gl.getUniformLocation( shaderProgram, 'umvMat' ),
                             lightColor:gl.getUniformLocation(shaderProgram,'uLightColor'),
                             lightDir:gl.getUniformLocation(shaderProgram,'uLightDir'),
                         },
                     };

                     break;


                 }

                 default :console.log('deving ')

             }

             complete();

         },
         loadShader:function( gl,type,src ){

             const  shader = gl.createShader( type );

             gl.shaderSource( shader , src );

             // 编译

             gl.compileShader( shader );

             // 异常检测
             if(!gl.getShaderParameter( shader , gl.COMPILE_STATUS ))
             {
                 console.error( `error: ${gl.getShaderInfoLog( shader )}`)
                 gl.deleteShader( shader );
                 return null ;
             }

             return shader ;

         },
         getGL:function () {

             return ia.world.gl;

         },
         getCanvas:function () {

             return ia.world.canvas;

         },

         vAttrib:{
                numComponents : 2,
                type : '',
                normalize : false,
                stride : 0,
                offset : 0,

            },

         fAttrib:{

                 numComponents : 4,
                 type : '',
                 normalize : false,
                 stride : 0,
                 offset : 0,
         },

         buffer:{

             attribute :{
                 array: '',
                 draw: '',
                 positions:[],

             },


             positionBuffer:{

               initBuffer:function ( pos=[0.0,0.0,],colors=[ 1.0, 0.0, 0.0, 1.0 ] , array = ia.world.gl.ARRAY_BUFFER, draw  = ia.world.gl.STATIC_DRAW,) {

                   let gl = ia.world.gl;

                   let positionBuffer = gl.createBuffer();

                   gl.bindBuffer( array, positionBuffer );


                   let positions = pos;


                   // 创建Float32 ，填充当前缓冲区

                   gl.bufferData( array,
                       new Float32Array(positions),
                       draw );

                   ia.world.buffer.attribute ={
                       positions:pos,

                   };

                   let colorBuffer = gl.createBuffer();
                   gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
                   gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );

                   return {
                       position: positionBuffer,
                       color:colorBuffer
                   };

               }


            },

             textureBuffer:{

               initBuffer:function ( pos=[],coord=[],index=[] ) {

                   let gl = ia.world.gl;
                   let positionBuffer = gl.createBuffer();
                   gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );

                   // 顶点坐标
                   let positions = pos;
                   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

                   let textureCoordBuffer = gl.createBuffer();
                   gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

                   // todo 纹理坐标    uv反序    值得注意的是webgl 的三维坐标 y是屏幕朝上的，   而屏幕二维坐标的y 是朝下的

                  // let textureCoordinates = ia.world.buffer.textureBuffer.uvReverse( coord);
                   let textureCoordinates =  coord;

                   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                       gl.STATIC_DRAW);

                   // 顶点buffer
                   let indexBuffer = gl.createBuffer();
                   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

                   let indices = index;
                   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                       new Uint16Array(indices), gl.STATIC_DRAW);

                   ia.world.buffer.attribute ={
                       positions:pos,
                       textureCoord:coord,
                       indices:index

                   };

                   return {
                       position: positionBuffer,
                       textureCoord: textureCoordBuffer,
                       indices: indexBuffer,
                   };

               },

               // todo  反转uv  以达到 图片转正效果，  准备弃用   2019.6.18   --thinkia
               uvReverse:function ( array =[] ) {

                   let temp =[];
                   for(let i=0;i<array.length;i++) i%2==0 ? temp[i] =array[array.length-i-2]: temp[i] =array[array.length-i];
                   return temp;

               }
             },

             simpleLightBuffer:{
                 initBuffer:function ( pos =[],colors=[],index=[],normals=[]) {


                        let gl = ia.world.gl;

                        // positions
                        let positionBuffer = gl.createBuffer();

                        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

                        let positions = pos;

                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


                        // colors
                        let colorsBuffer = gl.createBuffer();

                        gl.bindBuffer( gl.ARRAY_BUFFER,colorsBuffer );

                        let color = colors;

                        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array( color),gl.STATIC_DRAW );

                        // indices
                        let indexBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);


                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index),gl.STATIC_DRAW );

                        // normal
                       let normalBuffer = gl.createBuffer();
                       gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

                       gl.bufferData(gl.ARRAY_BUFFER,new Float32Array( normals ), gl.STATIC_DRAW );


                       // 保存buffer  attrib
                       ia.world.buffer.attribute.positions = positions;
                       ia.world.buffer.attribute.normals = normals
                       ia.world.buffer.attribute.colors = colors;
                       ia.world.buffer.attribute.indices = index;



                       return {

                           position:positionBuffer,
                           normal:normalBuffer,
                           color:colorsBuffer,
                           indices:indexBuffer

                       }

                 }
             }

         },
         // 这里提供最基本的mvMat ，pMat和 vPos 配置
         helloIaWorld:function ( buffers ,needClear=true) {

             let gl = ia.world.gl;

             let programInfo = ia.world.programInfo;

             if(needClear)
             {
                 gl.clearColor(0.0, 0.0, 0.0, 1.0);  // rgba 值
                 gl.clearDepth(1.0);          // 清除所有图层
                 gl.enable(gl.DEPTH_TEST);           // 开启深度测试
                 gl.depthFunc(gl.LEQUAL);            // 遮挡效果

                 // 清理canvas.

                 gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
             }
             // u :uniform   pMat: 投影矩阵
             let upMat = ia.eyes.mat4;

             // u:uniform  mvMat : mv矩阵
             let umvMat = ia.view.mat4;

             let vAttrib = ia.world.vAttrib;

             gl.useProgram(programInfo.program);

             // Set the shader uniforms

             gl.uniformMatrix4fv(
                 programInfo.uniformLocations.projectionMatrix,
                 false,
                 upMat);
             gl.uniformMatrix4fv(
                 programInfo.uniformLocations.modelViewMatrix,
                 false,
                 umvMat);



             ia.world.program = programInfo.program;

             {
                 let numComponents = vAttrib.numComponents;
                 let type = gl.FLOAT;
                 let normalize = vAttrib.normalize;
                 let stride = vAttrib.stride;
                 let offset = vAttrib.offset;

                 gl.bindBuffer( gl.ARRAY_BUFFER, buffers.position );
                 gl.vertexAttribPointer(
                     programInfo.attribLocations.vertexPosition,
                     numComponents,
                     type,
                     normalize,
                     stride,
                     offset);
                 gl.enableVertexAttribArray(
                     programInfo.attribLocations.vertexPosition);
             }


             let fAttrib = ia.world.fAttrib;


             // 片元着色
             // todo colors 和 纹理取的rgba 是一样的吗？  这里我把纹理颜色 归在colors 里面  2019.6.14  --thinkia
             let numComponents = fAttrib.numComponents;
             let type = gl.FLOAT;
             let normalize = fAttrib.normalize;
             let stride = fAttrib.stride;
             let offset = fAttrib.offset;


             switch ( ia.colorful.curVF) {
                 case 0:{
                     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
                     gl.vertexAttribPointer(
                         programInfo.attribLocations.vertexColor,
                         numComponents,
                         type,
                         normalize,
                         stride,
                         offset);
                     gl.enableVertexAttribArray(
                         programInfo.attribLocations.vertexColor);
                     break;
                 }


                 case 1:{

                     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
                     gl.vertexAttribPointer(
                         programInfo.attribLocations.textureCoord,
                         numComponents,
                         type,
                         normalize,
                         stride,
                         offset);
                     gl.enableVertexAttribArray(
                         programInfo.attribLocations.textureCoord);

                     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);


                     gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

                     break;
                 }

                 case 2:{
                     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
                     gl.vertexAttribPointer(
                         programInfo.attribLocations.vertexColor,
                         numComponents,
                         type,
                         normalize,
                         stride,
                         offset);
                     gl.enableVertexAttribArray(
                         programInfo.attribLocations.vertexColor);
                     break;
                 }
                 default : console.log( 'deving ')
             }

         },

         updateMat4:function( updateEyes=false,updateView=true ){

             let gl = ia.world.gl;
             let programInfo = ia.world.programInfo;

             // u :uniform   pMat: 投影矩阵
             let upMat = ia.eyes.mat4;

             // u:uniform  mvMat : mv矩阵
             let umvMat = ia.view.mat4;

             gl.useProgram(programInfo.program);

             if( updateEyes)
             {
                 gl.uniformMatrix4fv(
                     programInfo.uniformLocations.projectionMatrix,
                     false,
                     upMat);
             }

             if( updateView)
             {
                 gl.uniformMatrix4fv(
                     programInfo.uniformLocations.modelViewMatrix,
                     false,
                     umvMat);
             }
         },

         clearColor:function(){
             let gl = ia.world.gl;

             gl.clearColor(0.0, 0.0, 0.0, 1.0);  // rgba 值
             gl.clearDepth(1.0);         // 清除所有图层
             gl.enable(gl.DEPTH_TEST);           // 开启深度测试
             gl.depthFunc(gl.LEQUAL);            // 遮挡效果

             // 清理canvas.

             gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
         },

         // 画点   num 一般为2或者3   vertexCount 为要绘制的顶点数

         drawPoints:function ( size =10, offset=0,count ) {

             let num=ia.world.vAttrib.numComponents;
             let gl = ia.world.gl;

             let vCount;

             count? vCount =count :vCount =ia.world.buffer.attribute.positions.length/num -offset;

             if( offset+vCount>ia.world.buffer.attribute.positions.length/num )
             {
                 console.log(' no vertices ')
                 return
             }


             // 顶点数量

             let uPointSize = gl.getUniformLocation( ia.world.program,'uPointSize' );

             gl.uniform1f( uPointSize ,size);

             gl.drawArrays( gl.POINTS, offset, vCount );

         },

            /**
             *
             * @param way
             *
             *  1  --> LINES  绘制线段 两个一组
             *  2  --> LINE_STRIP 绘制线段 依次连接
             *  3  --> LINE_LOOP 绘制线段 依次连接 首尾相连
             *
             */
         drawLines:function ( way=1,offset=0,vertexCount,num=ia.world.vAttrib.numComponents ) {

             let gl = ia.world.gl;

             let vCount;

             vCount =vertexCount?vertexCount: ia.world.buffer.attribute.positions.length/num;

             switch ( way ) {
                 case 1: {
                     gl.drawArrays(gl.LINES, offset, vCount);
                     break;
                 }
                 case 2:{
                     gl.drawArrays(gl.LINE_STRIP, offset, vCount);
                     break;
                 }
                 case 3:{
                     gl.drawArrays(gl.LINE_LOOP, offset, vCount);
                     break;
                 }
                 default: console.log(' deving ');
             }


         },

            /**
             *
             * @param way
             *  1 --> TRIANGLES        绘制三角形 三个顶点一组
             *  2 --> TRIANGLE_STRIP   绘制三角形 依次组成三角形
             *  3 --> TRIANGLE_FAN     以第一个顶点为中心点，其他顶点作为边缘点依次绘制
             *
             * @param num
             *
             * @param offset
             *
             * @param vertexCount
             *
             */

         drawTriangle:function ( way=2,offset=0,vertexCount,num=ia.world.vAttrib.numComponents) {

             let gl = ia.world.gl;

             let vCount;

             vCount =vertexCount?vertexCount: ia.world.buffer.attribute.positions.length/num;

             switch ( way ) {
                 case 1: {
                     gl.drawArrays(gl.TRIANGLES, offset, vCount);
                     break;
                 }
                 case 2:{
                     gl.drawArrays(gl.TRIANGLE_STRIP, offset, vCount);
                     break;
                 }
                 case 3:{
                     gl.drawArrays(gl.TRIANGLE_FAN, offset, vCount);
                     break;
                 }
                 default: console.log(' deving ');
             }

         },

         drawTexture( offset=0, count=ia.world.buffer.attribute.indices.length, type=ia.world.gl.UNSIGNED_SHORT, mode=ia.world.gl.TRIANGLES) {

             let gl = ia.world.gl;

             gl.drawElements(mode,count,type,offset);

         }

        };


        // ia's soul  动画工具

        ia.soul = {

            // tween
            time:{

                oriTimer:0,
                oriStart:'',
                oriEnd:'',
                go:function (  start , end, timer = 120, way =1    ) {

                    switch ( way ){

                        // line
                        case 1: {

                            if( ia.soul.time.oriTimer > timer ) return ;

                            if( ia.soul.time.oriTimer < 1 )
                            {
                                ia.soul.time.oriStart = start ;
                                ia.soul.time.oriEnd = end;
                            }

                            for( let i = 0 ;i< start.length;i++ )
                            {
                                let startBeta = ia.soul.time.oriStart;
                                let endBeta = ia.soul.time.oriEnd;
                                start[i] = startBeta[ i ]  + ia.soul.time.oriTimer * ( endBeta[i] - startBeta[i] ) / timer ;
                            }

                            ia.soul.time.oriTimer++;

                            break;
                        }

                        default : console.log( ' dev   ing  ' )

                    }


                },
                reTime:function () {
                    ia.soul.oriTimer = 0;
                }
            },

        };

        // thinkMath   http://www.songho.ca/opengl/gl_matrix.html     常用的数学类库

        ia.thinkMath = {

            mat4:{
                 // translation
                jump: function ( mat4,vec ) {
                         for(let i =0 ;i<4;i++)
                             mat4[12+i] = mat4[i] * vec[0] + mat4[i+4] * vec[1] + mat4[i+8] * vec[2] + mat4[i+12]
                 } ,

                rotate:function ( mat4, vec , rad ,needNor = true ) {

                    let  normaVec3 = vec;

                    // vec is normalized?

                    //  如果传的是单位向量  needNor 可以设置为false;   在一些反复计算中可以减少计算量 优化程序;

                    if( needNor )
                    {

                        let length = Math.sqrt(vec[0] * vec [0] + vec[1] * vec[1] + vec[2] * vec[2] );

                        if( length < 0.000001 ) return null;

                        normaVec3[0] = vec[0] /  length;
                        normaVec3[1] = vec[1] /  length;
                        normaVec3[2] = vec[2] /  length;

                    }

                    // rotate

                    let  s = Math.sin( rad );
                    let  c = Math.cos( rad );
                    let  t  = 1 - c ;

                    let a00 = mat4[0] , a01 = mat4[1] , a02 = mat4[2]  , a03 = mat4[3] ,
                        a10 = mat4[4] , a11 = mat4[5] , a12 = mat4[6]  , a13 = mat4[7] ,
                        a20 = mat4[8] , a21 = mat4[9] , a22 = mat4[10] , a23 = mat4[11];

                    let b00 = normaVec3[0] * normaVec3[0] * t + c ,               b01 = normaVec3[1] * normaVec3[0] * t + normaVec3[2] *s ,      b02 = normaVec3[2] *normaVec3[0] *t - normaVec3[1] * s ,
                        b10 = normaVec3[0] * normaVec3[1] * t - normaVec3[2] *s , b11 = normaVec3[1] * normaVec3[1] * t + c,                     b12 = normaVec3[2] *normaVec3[1] *t + normaVec3[0] * s ,
                        b20 = normaVec3[0] * normaVec3[2] * t + normaVec3[1] *s , b21 = normaVec3[1] * normaVec3[2] * t - normaVec3[0] *s,       b22 = normaVec3[2] *normaVec3[2] *t  + c;

                    mat4[0] = a00 * b00 + a10 * b01 + a20 * b02;
                    mat4[1] = a01 * b00 + a11 * b01 + a21 * b02;
                    mat4[2] = a02 * b00 + a12 * b01 + a22 * b02;
                    mat4[3] = a03 * b00 + a13 * b01 + a23 * b02;

                    mat4[4] = a00 * b10 + a10 * b11 + a20 * b12;
                    mat4[5] = a01 * b10 + a11 * b11 + a21 * b12;
                    mat4[6] = a02 * b10 + a12 * b11 + a22 * b12;
                    mat4[7] = a03 * b10 + a13 * b11 + a23 * b12;

                    mat4[8] = a00 * b20 + a10 * b21 + a20 * b22;
                    mat4[9] = a01 * b20 + a11 * b21 + a21 * b22;
                    mat4[10] = a02 * b20 + a12 * b21 + a22 * b22;
                    mat4[11] = a03 * b20 + a13 * b21 + a23 * b22;


                },

                multiply:function ( lMat4,rMat4  ) {

                    let a11 = lMat4[ 0 ], a12 = lMat4[ 4 ], a13 = lMat4[ 8 ], a14 = lMat4[ 12 ];
                    let a21 = lMat4[ 1 ], a22 = lMat4[ 5 ], a23 = lMat4[ 9 ], a24 = lMat4[ 13 ];
                    let a31 = lMat4[ 2 ], a32 = lMat4[ 6 ], a33 = lMat4[ 10 ], a34 = lMat4[ 14 ];
                    let a41 = lMat4[ 3 ], a42 = lMat4[ 7 ], a43 = lMat4[ 11 ], a44 = lMat4[ 15 ];

                    let b11 = rMat4[ 0 ], b12 = rMat4[ 4 ], b13 = rMat4[ 8 ], b14 = rMat4[ 12 ];
                    let b21 = rMat4[ 1 ], b22 = rMat4[ 5 ], b23 = rMat4[ 9 ], b24 = rMat4[ 13 ];
                    let b31 = rMat4[ 2 ], b32 = rMat4[ 6 ], b33 = rMat4[ 10 ], b34 = rMat4[ 14 ];
                    let b41 = rMat4[ 3 ], b42 = rMat4[ 7 ], b43 = rMat4[ 11 ], b44 = rMat4[ 15 ];

                    lMat4[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
                    lMat4[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
                    lMat4[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
                    lMat4[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

                    lMat4[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
                    lMat4[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
                    lMat4[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
                    lMat4[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

                    lMat4[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
                    lMat4[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
                    lMat4[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
                    lMat4[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

                    lMat4[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
                    lMat4[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
                    lMat4[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
                    lMat4[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

                    return lMat4;
                },

                getInverse:function ( mat4 ) {
                    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

                    let te = [
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1],
                        me = mat4,
                        n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ], n41 = me[ 3 ],
                        n12 = me[ 4 ], n22 = me[ 5 ], n32 = me[ 6 ], n42 = me[ 7 ],
                        n13 = me[ 8 ], n23 = me[ 9 ], n33 = me[ 10 ], n43 = me[ 11 ],
                        n14 = me[ 12 ], n24 = me[ 13 ], n34 = me[ 14 ], n44 = me[ 15 ],

                        t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
                        t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
                        t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
                        t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

                        let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

                        if( det === 0 )
                        {
                            return te;
                        }

                    let detInv = 1 / det;

                    te[ 0 ] = t11 * detInv;
                    te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
                    te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
                    te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

                    te[ 4 ] = t12 * detInv;
                    te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
                    te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
                    te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

                    te[ 8 ] = t13 * detInv;
                    te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
                    te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
                    te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

                    te[ 12 ] = t14 * detInv;
                    te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
                    te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
                    te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

                    return te;
                },

                // 待验证
                lookAt:function ( mat4, eye,target,up ) {

                    let te = mat4;

                    let z =[
                        eye[0]-target[0],
                        eye[1]-target[1],
                        eye[2]-target[2],
                    ]
                    // eye 与 target 在同一坐标
                    if(z[0]===0&&z[1]===0&&z[2]===0 )
                    {
                        z[2] = 1;
                    }

                    let x =[
                        up[0]-z[0],
                        up[1]-z[1],
                        up[2]-z[2],
                    ]

                    if ( x[0]===0&&x[1]===0&&x[2]===0 ) {

                        // up and z are parallel

                        if ( Math.abs( up[2] ) === 1 ) {

                            z[0] += 0.0001;

                        } else {

                            z[2] += 0.0001;

                        }

                        z.normalize();
                        x =[
                            up[0]-z[0],
                            up[1]-z[1],
                            up[2]-z[2],
                        ]

                    }

                    x.normalize();
                    let y =[
                        z[0]-x[0],
                        z[1]-x[1],
                        z[2]-x[2],
                    ]

                    te[ 0 ] = x[0]; te[ 4 ] = y[0]; te[ 8 ] = z[0];
                    te[ 1 ] = x[1]; te[ 5 ] = y[1]; te[ 9 ] = z[1];
                    te[ 2 ] = x[2]; te[ 6 ] = y[2]; te[ 10 ] = z[2];

                }


            },

            euler:{

                toMat4:function ( euler ) {

                    let mat4 = [
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ];
                    let x = euler.cell[0], y = euler.cell[1], z = euler.cell[2];
                    let a = Math.cos( x ), b = Math.sin( x );
                    let c = Math.cos( y ), d = Math.sin( y );
                    let e = Math.cos( z ), f = Math.sin( z );


                    if( euler.order === 'ZYX')
                    {
                        let ae = a * e, af = a * f, be = b * e, bf = b * f;

                        mat4[ 0 ] = c * e;
                        mat4[ 4 ] = be * d - af;
                        mat4[ 8 ] = ae * d + bf;

                        mat4[ 1 ] = c * f;
                        mat4[ 5 ] = bf * d + ae;
                        mat4[ 9 ] = af * d - be;

                        mat4[ 2 ] = - d;
                        mat4[ 6 ] = b * c;
                        mat4[ 10 ] = a * c;
                    }

                   return mat4;
                }


            },

            vec3:{
                // 三角形面积
                triangleArea : function ( pointA,pointB,pointC ) {

                    let area = 0 ;
                    let side = [];

                    side[0] = Math.sqrt( Math.pow(pointA[0] -pointB[0],2) +Math.pow(pointA[1] -pointB[1],2) +Math.pow(pointA[2] -pointB[2],2) );
                    side[1] = Math.sqrt( Math.pow(pointB[0] -pointC[0],2) +Math.pow(pointB[1] -pointC[1],2) +Math.pow(pointB[2] -pointC[2],2) );
                    side[2] = Math.sqrt( Math.pow(pointC[0] -pointA[0],2) +Math.pow(pointC[1] -pointA[1],2) +Math.pow(pointC[2] -pointA[2],2) );
                    // 不能构成三角形
                    if( side[0] +side[1] <= side[2] ||side[1] +side[2] <= side[0] ||side[2] +side[0] <= side[1] )  return area;

                    // 海伦公式： s =sqr(p*(p-a)(p-b)(p-c));
                    let p = ( side[0]+side[1]+side[2] )/2.0;

                    area = Math.sqrt(p*( p - side[0] )*( p-side[1] )* ( p-side[2] ));

                    return area

                },
                // 平面方程   Ax+By+Cz+D =0
                planeEquation:function ( pointA,pointB,pointC ) {

                    let PE= {
                            A:1,
                            B:0,
                            C:0,
                            D:0,
                    };
                    // 待定系数法
                    PE.A = ( pointC[1] - pointA[1] )*( pointC[2] - pointA[2] ) - ( pointB[2] - pointA[2])*( pointC[1] - pointA[1] );
                    PE.B = ( pointC[0] - pointA[0] )*( pointB[2] - pointA[2] ) - ( pointB[0] - pointA[0])*( pointC[2] - pointA[2] );
                    PE.C = ( pointB[0] - pointA[0] )*( pointC[1] - pointA[1] ) - ( pointC[0] - pointA[0])*( pointB[1] - pointA[1] );

                    PE.D = -( PE.A * pointA[0] + PE.B * pointA[1] + PE.C * pointA[2] );

                    return PE ;
                },
                // 已知三点求法向量
                pNormal:function ( pointA,pointB,pointC ) {

                    let vec = {
                        x:1,
                        y:0,
                        z:0
                    };
                   let PE = ia.thinkMath.vec3.planeEquation( pointA,pointB,pointC );
                   vec.x = PE.A;
                   vec.y = PE.B;
                   vec.z = PE.C;

                   return vec;
                },
                // https://blog.csdn.net/smallflyingpig/article/details/51234711
                // 该链接内容需要修正
                /**
                 *
                 * @param p1   射线起始点
                 * @param p2   射线终点
                 * @param pointA 三角面片 顶点A
                 * @param pointB 三角面片 顶点B
                 * @param pointC 三角面片 顶点C
                 * @returns {boolean}
                 *
                 */

                intersectionLinePlane:function ( p1,p2,pointA,pointB,pointC ) {

                    let pointD =[];
                    let p1p2 = [ p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2] ];
                    let PE = ia.thinkMath.vec3.planeEquation( pointA,pointB,pointC );

                    let num = PE.A * p1[0] + PE.B * p1[1] + PE.C * p1[2] + PE.D ;
                    let den = PE.A * p1p2[0] + PE.B * p1p2[1] + PE.C*p1p2[2];
                    // 平行  与法向量垂直
                    if( Math.abs(den) <1e-5 )  return false ;

                    let n = -num/den ;

                    for( let i=0;i<3;i++) pointD[i] = p1[i] + n*p1p2[i];

                    // ABC 面积
                    let s0 = ia.thinkMath.vec3.triangleArea( pointA,pointB,pointC );
                    // DAB 面积
                    let s1 = ia.thinkMath.vec3.triangleArea( pointD,pointB,pointC );
                    // DBC 面积
                    let s2 = ia.thinkMath.vec3.triangleArea( pointA,pointD,pointC );
                    // DCA 面积
                    let s3 = ia.thinkMath.vec3.triangleArea( pointA,pointB,pointD);

                    if( Math.abs( (s1+s2+s3 -s0)) < 1e-6 )
                    {
                        console.log(`射线交点坐标：${pointD}` ) ;
                        return true;
                    }

                    else
                        return false;

                },

                //  求得经过旋转变换后的三维坐标

                applyMat4:function ( vec ,mat4 ) {

                    let temVec = [vec[0],vec[1],vec[2] ];
                    let w = 1 / ( mat4[ 3 ] * vec[0] + mat4[ 7 ] * vec[1] + mat4[ 11 ] * vec[2] + mat4[ 15 ] );
                    for( let i=0;i<3;i++)
                        vec[i] = ( mat4[ i ] * temVec[0] + mat4[ 4 +i ] * temVec[1] + mat4[ 8+i ] * temVec[2] + mat4[ 12+i ] ) * w;

                    return vec ;
                },


                /**
                 *
                 * @param vec
                 * @param vec2
                 *
                 * 返回结果为两向量夹角  弧度
                 */
                applyVec3:function (vec,vec2 ) {

                    let  temVec=[],temVec2=[];

                    let result;

                    let cosTheta;

                    for(let i=0;i<3;i++)
                    {
                        temVec[i] = vec[i];
                        temVec2[i] = vec2[i];
                    }

                    let top =0;
                    let bot ;

                    for( let i=0;i<3;i++)
                        top+=temVec[i]*temVec2[i];

                    bot = Math.sqrt(temVec[0]*temVec[0] +temVec[1]*temVec[1] +temVec[2]*temVec[2]) *
                          Math.sqrt(temVec2[0]*temVec2[0] +temVec2[1]*temVec2[1] +temVec2[2]*temVec2[2]) ;

                    cosTheta = top/bot;

                    result =180* Math.acos( cosTheta )/Math.PI;

                    return result;

                }




            }
        };


        // action
        ia.action = {

                eyes:{
                    // 关于透视投影的理解可以参阅下面两个链接
                    // https://stackoverflow.com/questions/28286057/trying-to-understand-the-math-behind-the-perspective-matrix-in-webgl/28301213#28301213
                    // http://www.songho.ca/opengl/gl_projectionmatrix.html
                    openEyes:function(
                                            fov = 50 * Math.PI/180,
                                            near = 0.1 ,
                                            far  = 1000.0,
                                            aspect = window.innerHeight/window.innerWidth
                                        ) {

                        if( ia.eyes.isOpen || !fov || near === far ) return ;

                        let mat4 = ia.eyes.mat4;
                        mat4[0] = aspect/Math.tan(fov/2) ;
                        mat4[5] = mat4[0] / aspect ;
                        mat4[10] = ( far + near ) / ( near - far ) ;
                        mat4[11] = -1;
                        mat4[14] = 2 * far * near /( near - far)
                        mat4[15] = 0;

                        ia.eyes.isOpen = true;


                },
                    blink:function (  fov = 50 * Math.PI/180,
                                       near = 0.1 ,
                                       far  = 1000.0,
                                       aspect = window.innerHeight/window.innerWidth ) {
                        ia.eyes.isOpen =false;
                        ia.action.eyes.openEyes( fov,near,far,aspect );
                    },

                    rotate:function ( vec , rad ,needNor) {

                        let mat4 = ia.eyes.mat4;

                        return ia.thinkMath.mat4.rotate( mat4 , vec , rad ,needNor );

                    },
                    lookAbout:function (  rMat4  ) {

                        let lMat4 = ia.eyes.mat4;

                        return ia.thinkMath.mat4.multiply( lMat4,rMat4 );

                    }

            },

                view:{

                    jump:function ( vec ) {

                        let mat4 = ia.view.mat4;

                        return  ia.thinkMath.mat4.jump( mat4 , vec );

                    },

                    walk:function ( vec , timer ) {

                        let  finalMat4 = [];

                        for( let i =0;i<ia.view.mat4.length;i++)
                        {
                            finalMat4[i] = ia.view.mat4[i]
                        }

                        ia.thinkMath.mat4.jump( finalMat4 , vec );

                        ia.soul.time.go( ia.view.mat4, finalMat4 , timer  ) ;

                    },

                    rotate:function ( vec , rad ,needNor ) {

                       let mat4 = ia.view.mat4;

                       return ia.thinkMath.mat4.rotate( mat4 , vec , rad,needNor );

                    },
                    lookAbout:function (  rMat4  ) {

                        let lMat4 = ia.view.mat4;

                        return ia.thinkMath.mat4.multiply( lMat4,rMat4 );

                    }
            },



        };


        // 初始化透视矩阵
        ia.action.eyes.openEyes();

        // 观察的矩形 向 z轴的反方向跳跃了5个距离;

        ia.action.view.jump( [0,0,-5] );

        return ia;

    }









