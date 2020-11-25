class mainThreeJS {

    constructor() {
        this.mainCanvas = $('#mainCanvas')[0];
        this.cubeMesh;
        this.scene = new THREE.Scene();
        this.width = 400;
        this.height = 300;
        this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 0.1, 10000 );
        this.intervalId; // keep the ret val from setTimeout()
        this.intervals = [];
        this.intervalsCamera = [];
        this.intervalsCube = [];
        this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
        this.material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
        this.cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
        this.skyColor = 0xB1E1FF;  // light blue
        this.groundColor = 0x7A3AC9;  // brownish orange
        this.intensity = 1;
        this.light = new THREE.HemisphereLight(this.skyColor, this.groundColor, this.intensity);
        this.topColor =  0x0077ff;
        this.bottomColor =  0x330077;
        this.skyOffset = 33;
        this.skyExponent = 0.7;
        this.vertexShader = document.getElementById( 'vertexShader' ).textContent;
        this.fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
        this.uniforms = {
            "topColor": { value: new THREE.Color(this.topColor) },
            "bottomColor": { value: new THREE.Color(this.bottomColor) },
            "offset": { value: this.skyOffset },
            "exponent": { value: this.skyExponent }
        };
        this.skyGeo = new THREE.SphereBufferGeometry( 4000, 32, 15 );
        this.skyMat = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            side: THREE.BackSide
        } );    
        this.sky = new THREE.Mesh( this.skyGeo, this.skyMat );
        this.gui = new dat.GUI();
        this.renderer = new THREE.WebGLRenderer({canvas: this.mainCanvas});
    }

    run_camera(axis, movement)
    {
        if (movement == 'position')
        {
            if (axis == 'x-') { this.camera.position.x -= 0.05; }
            if (axis == 'x+') { this.camera.position.x += 0.05; }
            if (axis == 'y-') { this.camera.position.y -= 0.05; }
            if (axis == 'y+') { this.camera.position.y += 0.05; }
            if (axis == 'z-') { this.camera.position.z -= 0.05; }
            if (axis == 'z+') { this.camera.position.z += 0.05; }
        }
        else if (movement == 'rotation')
        {
            if (axis == 'x-') { this.cubeMesh.rotation.x -= 3 * Math.PI / 180.0; }
            if (axis == 'x+') { this.cubeMesh.rotation.x += 3 * Math.PI / 180.0; }
            if (axis == 'y-') { this.cubeMesh.rotation.y -= 3 * Math.PI / 180.0; }
            if (axis == 'y+') { this.cubeMesh.rotation.y += 3 * Math.PI / 180.0; }
            if (axis == 'z-') { this.cubeMesh.rotation.z -= 3 * Math.PI / 180.0; }
            if (axis == 'z+') { this.cubeMesh.rotation.z += 3 * Math.PI / 180.0; }

            this.cubeMesh.rotation.x %= 2.0 * Math.PI;
            this.cubeMesh.rotation.y %= 2.0 * Math.PI;
            this.cubeMesh.rotation.z %= 2.0 * Math.PI;
        }
    }

    runme(divid) {
        this.cubeMesh.rotation.x %= 2.0 * Math.PI;
        this.cubeMesh.rotation.y %= 2.0 * Math.PI;
        this.cubeMesh.rotation.x += 0.05;
        this.cubeMesh.rotation.y += 0.05;
        document.getElementById(divid).innerHTML = parseFloat(document.getElementById(divid).innerHTML) + 1;
    }

    animate() {
        var classElem = this;
        requestAnimationFrame(() => {this.animate();});

        if (this.cubeMesh != null) {
            this.parameters.a = this.cubeMesh.rotation.x;
            this.parameters.b = this.cubeMesh.rotation.y;
        }

        this.gui.updateDisplay();

        if (this.cubeMesh != null) {
            var x = this.cubeMesh.rotation.x * 180.0 / Math.PI;
            var y = this.cubeMesh.rotation.y * 180.0 / Math.PI;
            var z = this.cubeMesh.rotation.z * 180.0 / Math.PI;

            x = Math.round(x * 100.0) / 100.0;
            y = Math.round(y * 100.0) / 100.0;
            z = Math.round(z * 100.0) / 100.0;

            var q = EulerToQuaternion({x,y,z},"XYZ");
            document.getElementById('rotation').innerHTML = 'Cube Rotation: Euler: X:' + x + ', Y:' + y + ', Z:' + z + ' - Quaternion: X:'+q.x.toFixed(3)+', Y:'+q.y.toFixed(3)+', Z:'+q.z.toFixed(3)+', W:'+q.w.toFixed(3);

            var camera_x = this.camera.position.x;
            var camera_y = this.camera.position.y;
            var camera_z = this.camera.position.z;

            camera_x = Math.round(camera_x * 100.0) / 100.0;
            camera_y = Math.round(camera_y * 100.0) / 100.0;
            camera_z = Math.round(camera_z * 100.0) / 100.0;

            document.getElementById('camera-position').innerHTML = 'Camera Position: ' + camera_x + ', ' + camera_y + ', ' + camera_z;
        }

        this.renderer.render( this.scene, this.camera );
    }

    init() {
        const classElem = this;
    
        this.renderer.setClearColor(0xFFFFFF,1);
        this.renderer.setSize( 400, 300 );
        document.getElementById('main').appendChild( this.renderer.domElement );
    
        this.scene.add( this.light );
        this.camera.position.z = 5;
        this.scene.add( this.sky );
    
        this.parameters = 
        {
            a: 0.0, // numeric
            b: 0.0, // numeric slider
            c: this.skyColor, // string
            d: this.groundColor, // boolean (checkbox)
            e: this.intensity, // color (hex)
            f: this.topColor,
            g: this.bottomColor,
            h: this.skyOffset,
            i: this.skyExponent,
            v : 0,    // dummy value, only type is important
            w: "...", // dummy value, only type is important
            x: 0, y: 0, z: 0
        };
    
        this.skyColorField =     this.gui.addColor(  this.parameters, 'c' ).name('Sky Color');
        this.groundColorField =  this.gui.addColor(  this.parameters, 'd' ).name('Ground Color');
        this.intensityField =    this.gui.add(       this.parameters, 'e' ).step(0.01).name('Intensity');    
        this.topColorField =     this.gui.addColor(  this.parameters, 'f' ).name('Top Color');
        this.bottomColorField =  this.gui.addColor(  this.parameters, 'g' ).name("Bottom Color");
        this.skyOffsetField =    this.gui.add(       this.parameters, 'h' ).step(0.01).name('Sky Offset');
        this.skyExponentField =  this.gui.add(       this.parameters, 'i' ).step(0.01).name('Sky Exponent');
        this.parameters.a.toFixed(7);
        this.parameters.b.toFixed(7);    
        this.gui.open();

        this.skyColorField.onChange(function(value) {
            this.light.color.set(value);
            this.parameters.c = value;
        });
    
        this.groundColorField.onChange(function(value) {
            this.light.groundColor.set(value);
            this.parameters.d = value;
        });
    
        this.intensityField.onChange(function(value) {
            this.light.intensity = value;
            this.parameters.e = value;
        });
    
        this.topColorField.onChange(function(value) {
            this.skyMat.uniforms.topColor.value = (new THREE.Color(value));
            this.parameters.f = value;
        });
    
        this.bottomColorField.onChange(function(value) {
            this.skyMat.uniforms.bottomColor.value = (new THREE.Color(value));
            this.parameters.g = value;
        });
    
        this.skyOffsetField.onChange(function(value) {
            this.skyMat.uniforms.offset.value = value;
            this.parameters.h = value;
        });
    
        this.skyExponentField.onChange(function(value) {
            this.skyMat.uniforms.exponent.value = value;
            this.parameters.i = value;
        });

        this.loader = new THREE.FontLoader();
        this.loaderBlock = new THREE.GLTFLoader();
        this.loaderBlock.load('models/Cube.glb', function(gltf) {
                console.log(gltf);
                var mesh = gltf.scene.children[0];
                classElem.cubeMesh = mesh;
                classElem.scene.add(classElem.cubeMesh);
            },
    
            // onProgress callback
            function ( xhr ) {
                console.log( 'Cube Model ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
            },
            // onError callback
            function ( err ) {
                console.log( 'An error happened:');
                console.log(err);
        });
    
        this.animate();        
    }

    cube_mousedown(event, axis, frame, amount) {
        event.preventDefault();
        this.intervalsCube.push(setInterval(()=>{IncDecAxis(this.cubeMesh, this.cubeMesh.rotation, frame, axis, amount, 'XYZ');}, 25, this.cubeMesh, this.cubeMesh.rotation, frame, axis, amount, 'XYZ'));
    }

    cube_mouseup(event, axis) {
        //event.preventDefault();
        this.intervalsCube.forEach(element => {
            clearInterval(element);
        });
    }

    camera_mousedown(event, axis, movement) {
        event.preventDefault();
        this.intervalsCamera.push(setInterval(()=>{this.run_camera(axis, movement);}, 25, axis, movement))
    }

    camera_mouseup(event, axis) {
        //event.preventDefault();
        this.intervalsCamera.forEach(element => {
            clearInterval(element);
        });
    }

    mousedownfunc(event, divid) {
        event.preventDefault();
        this.intervals.push(setInterval(()=>{this.runme(divid);}, 25, divid));
    }

    mouseupfunc(event) {
        //event.preventDefault();
        this.intervals.forEach(element => clearInterval(element));
    }

    touchEventStub(event) {
        event.preventDefault();
    }
};

var main3D = new mainThreeJS();

$(document).ready(function() {
    main3D.init();
});