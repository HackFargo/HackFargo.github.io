
// Map Coords
// Bottom right lat 46.789304,  long -96.746274
// Top left 46.949147, -97.030545


var ParticleDanceDemo = new function () {

    var points = [];

    $.getJSON("http://api.hackfargo.co/calls/type/Party?start=3-20-2010&end=3-10-2014", function(data) {

        points = calcPoints(data, 25, 0xFF0000);

        createParticles();
    });

    $.getJSON("http://api.hackfargo.co/calls/type/Cat?start=3-20-2010&end=3-10-2014", function(data) {

        points = calcPoints(data, 10, 0x00FF00);

        createParticles();
    });


    var calcPoints = function (data, y, color) {

        var latMin = 46.789304,  longMin = -96.746274, //Bottom right 
            latMax = 46.949147, longMax = -97.030545;  // Top left 

        var length = data.length;
        var points = [];

        for (var i = 0; i <= 1000 && i <= data.length; i++) {
            // X is east west(LONG) +250 is east edge of town
            // Z is north south(LAT) +250 is south edge of town
            // Map cords
            var x = 500 * (longMax - data[i].Long) / (longMax - longMin) - 250;
            var z = 500 * (latMax - data[i].Lat) / (latMax - latMin) - 250;

            points.push({x:x, z:z, y:y, color: color});
        }

        return points;
    };

    // Constants
    var VIEW_ANGLE = 45,
        NEAR = 0.1,
        FAR = 10000;
    var DELTA =  Math.PI / (60 * 2);

    var renderer = null;
    var camera = null;
    var scene = null;
    var material = null;
    var attributes = null;
    var uniforms = null;
    var particleSystem = null;
    var particles = null;
    var colors = null;
    var rowCount = null;
    var columnCount = null;

    var mouseX = 0, mouseY = 0;
    var centerX = window.innerWidth / 2;
    var centerY = window.innerHeight / 2;

    // Incremented to create amplitude modulation and wave effect
    var omega = 0;
    var theta = 0;

    var that = this;

    // UI exposed variables
    // Exposed in realtime
    this.waveDensity = 4 * Math.PI;
    this.waveFlow = false;
    this.amplitude = 40;
    this.particleSize = 10;
    this.modulateAmplitude = true;
    this.rotate = false;
    this.mouseControl = true;

    this.init = function () {

        if ( ! Detector.webgl ) {
            Detector.addGetWebGLMessage();
        }
        else {
            setup();
            //createDatGui();
            render();
        }
    };

    function setup() {
        var container = document.createElement( 'div' );
        document.body.appendChild( container );

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera = new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            window.innerWidth / window.innerHeight,
            NEAR,
            FAR);

        scene = new THREE.Scene();

        // Bring the camera back and up a bit
        camera.position.z = 300;
        camera.position.y = 300;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        var img = new THREE.MeshBasicMaterial({
            map:THREE.ImageUtils.loadTexture('images/fargoMap.png')
        });
        img.map.needsUpdate = true;

        // Add the map at the orgin and rotate it so it can be layers on top of.
        var map = new THREE.Mesh(new THREE.PlaneGeometry(500, 500),img);
        map.overdraw = true;
        map.rotation.x = -90 * Math.PI/180;

        scene.add(map);

        // Add a light so we can see the image. 
        var ambientLight = new THREE.AmbientLight(0x555555);
        scene.add(ambientLight);

        container.appendChild(renderer.domElement);

        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    }

    function createParticles() {
        columnCount = rowCount = that.particleDensity;

        // Note this call may enforce a cross domain load policy
        // that required the image to be hosted and not loaded locallcy.
        // Using particle image from Paul Lewis (http://aerotwist.com/).
        var sprite = THREE.ImageUtils.loadTexture("images/particle.png");

        attributes = {
            color:     { type: "c", value: [] }
        };

        uniforms = {
            size: { type: 'f', value: this.size },
            texture:   { type: "t", value: 0, texture: sprite}
        };

        material = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            vertexColors: true,
            size:that.particleSize,
            map:sprite,
            blending:THREE.AdditiveBlending,
            transparent:true
        });


        // create the particles  and system
        particles = new THREE.Geometry();

        var length = points.length;
        points.forEach(function(point , index){
            //attributes.color[i] = new THREE.Color(0x0000FF);

                var particle = new THREE.Vertex(
                    new THREE.Vector3(point.x, point.y, point.z)
                );
                particles.vertices.push(particle);

                particles.colors.push(new THREE.Color(point.color));
        });        

        particleSystem = new THREE.ParticleSystem(
            particles,
            material);

        // also update the particle system to sort the particles which enables the behavious we want.
        particleSystem.sortParticles = true;

        scene.add(particleSystem);
        scene.add(camera);
    }

    function createDatGui() {
        var gui = new dat.GUI();
        var realtimeFolder = gui.addFolder('Realtime Fields');
        realtimeFolder.add(ParticleDanceDemo, 'waveDensity', 0, 16 * Math.PI).name('Wave Density');
        realtimeFolder.add(ParticleDanceDemo, 'amplitude', 0, 80).name('Amplitude');
        var sizeController = realtimeFolder.add(ParticleDanceDemo, 'particleSize', 5, 40).name('Particle Size');
        sizeController.onChange(function(value) {
            material.size = value;
        });

        realtimeFolder.add(ParticleDanceDemo, 'mouseControl').name('Mouse Look');
        realtimeFolder.open();
    }

    function render() {
       
        // Position the camera
        if (that.mouseControl) {

            // Camera position code from : http://mrdoob.github.com/three.js/examples/webgl_particles_billboards_colors.html
            // I would like to change this to something mouse and keyboard driven.
            camera.position.x += ( mouseX - camera.position.x ) * 0.05;
            camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
        }
        else {
            camera.position.z = 300;
            camera.position.y = 300;
        }
        camera.lookAt(new THREE.Vector3(100, 0, 0));
        
        renderer.render(scene, camera);

        // set up the next call
        requestAnimationFrame(render);
    }

    function onDocumentMouseMove( event ) {

        mouseX = event.clientX - centerX;
        mouseY = event.clientY - centerX;
    }

    function onWindowResize( event ) {

        camera.aspect = window.innerWidth / window.innerHeight;
        centerX = window.innerWidth / 2;
        centerY = window.innerHeight / 2;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }
};



$(function () {
    ParticleDanceDemo.init();
});