var lastRotation;

function IncDecAxis(mesh, rotation, frame, axis, amount, order)
{
    lastRotation = rotation.clone();

    var v = new THREE.Vector3();
    amount *= THREE.Math.DEG2RAD;
    if (axis == 'x') { v.set(amount, 0, 0); }
    else if (axis == 'y') { v.set(0, amount, 0); }
    else if (axis == 'z') { v.set(0, 0, amount); }

    var e = new THREE.Euler();
    e.setFromVector3(v, order);
    var m_inc = new THREE.Matrix4();
    m_inc = m_inc.makeRotationFromEuler(e);

    var m_orig = new THREE.Matrix4();
    m_orig = m_orig.makeRotationFromEuler(rotation);
    var m_final = new THREE.Matrix4();

    if (frame == "inertial") { 
        m_final = m_inc.multiply(m_orig);
        mesh.rotation.setFromRotationMatrix(m_final);
        var angles = matrix4ToEulerAngles(m_final);
        var angle = FindClosestAngle(lastRotation, angles[0], angles[1]);
        angle.x *= Math.PI / 180.0;
        angle.y *= Math.PI / 180.0;
        angle.z *= Math.PI / 180.0;
        mesh.rotation.setFromVector3(angle);
        return rotation;
    }
    else if (frame == 'add-pre' || frame == 'sub-pre' || frame == 'add-post' || frame == 'sub-post') {
        e.x = rotation.x;
        e.z = rotation.z;
        var premultiply = true;
        if (frame == 'add-post' || frame == 'sub-post') premultiply = false;
        var rot = EulerPitchRotationToMatrix(e, amount, axis, order, premultiply);
        if (premultiply) {
            m_final = rot.multiply(m_orig);
        }
        else {
            m_final = m_orig.multiply(rot);
        }
        var angles = matrix4ToEulerAngles(m_final);
        var angle = FindClosestAngle(lastRotation, angles[0], angles[1]);
        angle.x *= Math.PI / 180.0;
        angle.y *= Math.PI / 180.0;
        angle.z *= Math.PI / 180.0;
        mesh.rotation.setFromVector3(angle);
        return rotation;
    }
    else {
        // body frame 
        m_final = m_orig.multiply(m_inc);
        mesh.rotation.setFromRotationMatrix(m_final);
        var angles = matrix4ToEulerAngles(m_final);
        var angle = FindClosestAngle(lastRotation, angles[0], angles[1]);
        angle.x *= Math.PI / 180.0;
        angle.y *= Math.PI / 180.0;
        angle.z *= Math.PI / 180.0;
        mesh.rotation.setFromVector3(angle);
        return rotation;
    }
}

function MakeAnglePositive(angle)
{
    angle.x = (360.0 + angle.x) % 360.0;
    angle.y = (360.0 + angle.y) % 360.0;
    angle.z = (360.0 + angle.z) % 360.0;
    return angle;
}

function FindClosestAngle(last, angle1, angle2)
{
    var lastDegrees = last.clone();
    lastDegrees.x *= 180.0 / Math.PI;
    lastDegrees.y *= 180.0 / Math.PI;
    lastDegrees.z *= 180.0 / Math.PI;

    var dist1 = EulerAngularDistance(lastDegrees, angle1);
    var dist2 = EulerAngularDistance(lastDegrees, angle2);
    var dist1a = EulerAngularDistance2(lastDegrees, angle1);
    var dist2a = EulerAngularDistance2(lastDegrees, angle2);
    if (dist1 <= dist2) return angle1.clone();
    else return angle2.clone();
}

function EulerAngularDistance(angle1, angle2)
{
    angle1 = MakeAnglePositive(angle1);
    angle2 = MakeAnglePositive(angle2);

    var cx1 = Math.cos(angle1.x * Math.PI / 180.0);
    var cy1 = Math.cos(angle1.y * Math.PI / 180.0);
    var cz1 = Math.cos(angle1.z * Math.PI / 180.0);
    var sx1 = Math.sin(angle1.x * Math.PI / 180.0);
    var sy1 = Math.sin(angle1.y * Math.PI / 180.0);
    var sz1 = Math.sin(angle1.z * Math.PI / 180.0);

    var cx2 = Math.cos(angle2.x * Math.PI / 180.0);
    var cy2 = Math.cos(angle2.y * Math.PI / 180.0);
    var cz2 = Math.cos(angle2.z * Math.PI / 180.0);
    var sx2 = Math.sin(angle2.x * Math.PI / 180.0);
    var sy2 = Math.sin(angle2.y * Math.PI / 180.0);
    var sz2 = Math.sin(angle2.z * Math.PI / 180.0);

    var tx = (cx2-cx1)*(cx2-cx1) + (sx2-sx1)*(sx2-sx1);
    var ty = (cy2-cy1)*(cy2-cy1) + (sy2-sy1)*(sy2-sy1);
    var tz = (cz2-cz1)*(cz2-cz1) + (sz2-sz1)*(sz2-sz1);

    return Math.sqrt(tx+ty+tz);
}

function EulerAngularDistance2(angle1, angle2)
{
    var cx1 = Math.cos(angle1.x * Math.PI / 180.0);
    var cy1 = Math.cos(angle1.y * Math.PI / 180.0);
    var cz1 = Math.cos(angle1.z * Math.PI / 180.0);
    var sx1 = Math.sin(angle1.x * Math.PI / 180.0);
    var sy1 = Math.sin(angle1.y * Math.PI / 180.0);
    var sz1 = Math.sin(angle1.z * Math.PI / 180.0);

    var cx2 = Math.cos(angle2.x * Math.PI / 180.0);
    var cy2 = Math.cos(angle2.y * Math.PI / 180.0);
    var cz2 = Math.cos(angle2.z * Math.PI / 180.0);
    var sx2 = Math.sin(angle2.x * Math.PI / 180.0);
    var sy2 = Math.sin(angle2.y * Math.PI / 180.0);
    var sz2 = Math.sin(angle2.z * Math.PI / 180.0);

    var tx = (cx2-cx1)*(cx2-cx1) + (sx2-sx1)*(sx2-sx1);
    var ty = (cy2-cy1)*(cy2-cy1) + (sy2-sy1)*(sy2-sy1);
    var tz = (cz2-cz1)*(cz2-cz1) + (sz2-sz1)*(sz2-sz1);

    return Math.sqrt(tx)/2.0+Math.sqrt(ty)/2.0+Math.sqrt(tz)/2.0;
}

function EulerPitchRotationToMatrix(euler, amount, axis = 'Y', order = 'XYZ', premultiply = false)
{
    var cx, cy, cz, sx, sy, sz;
    cx = Math.cos(euler.x);
    cy = Math.cos(euler.y);
    cz = Math.cos(euler.z);
    sx = Math.sin(euler.x);
    sy = Math.sin(euler.y);
    sz = Math.sin(euler.z);
    var mat = new THREE.Matrix4();
    if (premultiply)
    {
        mat.elements[0] = cy;
        mat.elements[4] = -sx*sy;
        mat.elements[8] = cx*sy;
        mat.elements[1] = sx*sy;
        mat.elements[5] = cy*sx*sx+cx*cx;
        mat.elements[9] = cx*sx-cy*cx*sx;
        mat.elements[2] = -cx*sy;
        mat.elements[6] = cx*sx-cy*cx*sx;
        mat.elements[10] = cy*cx*cx+sx*sx;
    }
    else 
    {   
        mat.elements[0] = cy*cz*cz+sz*sz;
        mat.elements[4] = cz*sz-cy*cz*sz;
        mat.elements[8] = cz*sy;
        mat.elements[1] = cz*sz-cy*cz*sz;
        mat.elements[5] = cy*sz*sz+cz*cz;
        mat.elements[9] = -sz*sy;
        mat.elements[2] = -cz*sy;
        mat.elements[6] = sz*sy;
        mat.elements[10] = cy;
    }
    return mat;
}

function EulerToQuaternion(euler, order = 'XYZ')
{
    var xq = {w: Math.cos(euler.x/2 * Math.PI/180), x: Math.sin(euler.x/2 * Math.PI/180), y: 0, z: 0};
    var yq = {w: Math.cos(euler.y/2 * Math.PI/180), y: Math.sin(euler.y/2 * Math.PI/180), x: 0, z: 0};
    var zq = {w: Math.cos(euler.z/2 * Math.PI/180), z: Math.sin(euler.z/2 * Math.PI/180), x: 0, y: 0};

    var q1 = QuaternionProduct(xq, yq);
    var q2 = QuaternionProduct(q1, zq);

    return q2;
}

function EulerToMatrix(euler, order = 'XYZ')
{
    var cx = Math.cos(euler.x * Math.PI / 180.0);
    var cy = Math.cos(euler.y * Math.PI / 180.0);
    var cz = Math.cos(euler.z * Math.PI / 180.0);
    var sx = Math.sin(euler.x * Math.PI / 180.0);
    var sy = Math.sin(euler.y * Math.PI / 180.0);
    var sz = Math.sin(euler.z * Math.PI / 180.0);

    var xm = {m00: 1, m01: 0, m02: 0, m10: 0, m11: cx, m12: -sx, m20: 0, m21: sx, m22: cx};
    var ym = {m00: cy, m01: 0, m02: sy, m10: 0, m11: 1, m12: 0, m20: -sy, m21: 0, m22: cy};
    var zm = {m00: cz, m01: -sz, m02: 0, m10: sz, m11: cz, m12: 0, m20: 0, m21: 0, m22: 1};

    var m1 = MatrixProduct(xm,ym);
    var m2 = MatrixProduct(m1,zm);
    return m2;
}

function QuaternionProduct(q1, q2)
{
    var q = {w:0, x:0, y:0, z:0};
    q.w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
    q.x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
    q.y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
    q.z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
    return q;
}

function MatrixProduct(m1, m2)
{
    var m = {
        m00:m1.m00*m2.m00+m1.m01*m2.m10+m1.m02*m2.m20, 
        m01:m1.m00*m2.m01+m1.m01*m2.m11+m1.m02*m2.m21, 
        m02:m1.m00*m2.m02+m1.m01*m2.m12+m1.m02*m2.m22, 
        m10:m1.m10*m2.m00+m1.m11*m2.m10+m1.m12*m2.m20, 
        m11:m1.m10*m2.m01+m1.m11*m2.m11+m1.m12*m2.m21, 
        m12:m1.m10*m2.m02+m1.m11*m2.m12+m1.m12*m2.m22, 
        m20:m1.m20*m2.m00+m1.m21*m2.m10+m1.m22*m2.m20, 
        m21:m1.m20*m2.m01+m1.m21*m2.m11+m1.m22*m2.m21, 
        m22:m1.m20*m2.m02+m1.m21*m2.m12+m1.m22*m2.m22
    };
    return m;
}

function QuaternionText(order)
{
    var xText = `\\( \\begin{bmatrix} 
        \\cos(X/2) \\\\ 
        \\sin(X/2) \\\\ 
        0 \\\\
        0 \\\\
    \\end{bmatrix} \\)`;

    var yText = `\\( \\begin{bmatrix} 
        \\cos(Y/2) \\\\ 
        0 \\\\ 
        \\sin(Y/2) \\\\ 
        0 \\\\ 
    \\end{bmatrix} \\)`;

    var zText = `\\( \\begin{bmatrix} 
        \\cos(Z/2) \\\\ 
        0 \\\\
        0 \\\\
        \\sin(Z/2) \\\\
    \\end{bmatrix} \\)`;

    var eqText = `$=$`;

    // XYZ

    // -((sin(x/2)*sin(y/2))*sin(z/2))+((cos(x/2)*cos(y/2))*cos(z/2))
    // ((sin(x/2)*cos(y/2))*cos(z/2))+((cos(x/2)*sin(y/2))*sin(z/2))
    // -((sin(x/2)*cos(y/2))*sin(z/2))+((cos(x/2)*sin(y/2))*cos(z/2))
    // ((sin(x/2)*sin(y/2))*cos(z/2))+((cos(x/2)*cos(y/2))*sin(z/2))

    var XYZ = `\\( \\begin{bmatrix} 
        -((\\sin(x/2)*\\sin(y/2))*\\sin(z/2))+((\\cos(x/2)*\\cos(y/2))*\\cos(z/2)) \\\\
        ((\\sin(x/2)*\\cos(y/2))*\\cos(z/2))+((\\cos(x/2)*\\sin(y/2))*\\sin(z/2)) \\\\
        -((\\sin(x/2)*\\cos(y/2))*\\sin(z/2))+((\\cos(x/2)*\\sin(y/2))*\\cos(z/2)) \\\\
        ((\\sin(x/2)*\\sin(y/2))*\\cos(z/2))+((\\cos(x/2)*\\cos(y/2))*\\sin(z/2)) \\\\
    \\end{bmatrix} \\)`;

    // XZY
    
    // -(-(sin(x/2)*sin(z/2))*sin(y/2))+((cos(x/2)*cos(z/2))*cos(y/2))
    // ((sin(x/2)*cos(z/2))*cos(y/2))-((cos(x/2)*sin(z/2))*sin(y/2))
    // (-(sin(x/2)*sin(z/2))*cos(y/2))+((cos(x/2)*cos(z/2))*sin(y/2))
    // ((sin(x/2)*cos(z/2))*sin(y/2))+((cos(x/2)*sin(z/2))*cos(y/2))

    var XZY = `\\( \\begin{bmatrix} 
        -(-(\\sin(x/2)*\\sin(z/2))*\\sin(y/2))+((\\cos(x/2)*\\cos(z/2))*\\cos(y/2)) \\\\
        ((\\sin(x/2)*\\cos(z/2))*\\cos(y/2))-((\\cos(x/2)*\\sin(z/2))*\\sin(y/2)) \\\\
        (-(\\sin(x/2)*\\sin(z/2))*\\cos(y/2))+((\\cos(x/2)*\\cos(z/2))*\\sin(y/2)) \\\\
        ((\\sin(x/2)*\\cos(z/2))*\\sin(y/2))+((\\cos(x/2)*\\sin(z/2))*\\cos(y/2)) \\\\
    \\end{bmatrix} \\)`;

    // YZX
    
    // -((sin(y/2)*sin(z/2))*sin(x/2))+((cos(y/2)*cos(z/2))*cos(x/2))
    // ((sin(y/2)*sin(z/2))*cos(x/2))+((cos(y/2)*cos(z/2))*sin(x/2))
    // ((sin(y/2)*cos(z/2))*cos(x/2))+((cos(y/2)*sin(z/2))*sin(x/2))
    // -((sin(y/2)*cos(z/2))*sin(x/2))+((cos(y/2)*sin(z/2))*cos(x/2))

    var YZX = `\\( \\begin{bmatrix} 
        -((\\sin(y/2)*\\sin(z/2))*\\sin(x/2))+((\\cos(y/2)*\\cos(z/2))*\\cos(x/2)) \\\\
        ((\\sin(y/2)*\\sin(z/2))*\\cos(x/2))+((\\cos(y/2)*\\cos(z/2))*\\sin(x/2)) \\\\
        ((\\sin(y/2)*\\cos(z/2))*\\cos(x/2))+((\\cos(y/2)*\\sin(z/2))*\\sin(x/2)) \\\\
        -((\\sin(y/2)*\\cos(z/2))*\\sin(x/2))+((\\cos(y/2)*\\sin(z/2))*\\cos(x/2)) \\\\
    \\end{bmatrix} \\)`;

    // YXZ
    
    // -(-(sin(y/2)*sin(x/2))*sin(z/2))+((cos(y/2)*cos(x/2))*cos(z/2))
    // ((cos(y/2)*sin(x/2))*cos(z/2))+((sin(y/2)*cos(x/2))*sin(z/2))
    // -((cos(y/2)*sin(x/2))*sin(z/2))+((sin(y/2)*cos(x/2))*cos(z/2))
    // (-(sin(y/2)*sin(x/2))*cos(z/2))+((cos(y/2)*cos(x/2))*sin(z/2))

    var YXZ = `\\( \\begin{bmatrix} 
        -(-(\\sin(y/2)*\\sin(x/2))*\\sin(z/2))+((\\cos(y/2)*\\cos(x/2))*\\cos(z/2)) \\\\
        ((\\cos(y/2)*\\sin(x/2))*\\cos(z/2))+((\\sin(y/2)*\\cos(x/2))*\\sin(z/2)) \\\\
        -((\\cos(y/2)*\\sin(x/2))*\\sin(z/2))+((\\sin(y/2)*\\cos(x/2))*\\cos(z/2)) \\\\
        (-(\\sin(y/2)*\\sin(x/2))*\\cos(z/2))+((\\cos(y/2)*\\cos(x/2))*\\sin(z/2)) \\\\
    \\end{bmatrix} \\)`;

    // ZXY
    
    // -((sin(z/2)*sin(x/2))*sin(y/2))+((cos(z/2)*cos(x/2))*cos(y/2))
    // ((cos(z/2)*sin(x/2))*cos(y/2))-((sin(z/2)*cos(x/2))*sin(y/2))
    // ((sin(z/2)*sin(x/2))*cos(y/2))+((cos(z/2)*cos(x/2))*sin(y/2))
    // ((cos(z/2)*sin(x/2))*sin(y/2))+((sin(z/2)*cos(x/2))*cos(y/2))

    var ZXY = `\\( \\begin{bmatrix} 
        -((\\sin(z/2)*\\sin(x/2))*\\sin(y/2))+((\\cos(z/2)*\\cos(x/2))*\\cos(y/2)) \\\\
        ((\\cos(z/2)*\\sin(x/2))*\\cos(y/2))-((\\sin(z/2)*\\cos(x/2))*\\sin(y/2)) \\\\
        ((\\sin(z/2)*\\sin(x/2))*\\cos(y/2))+((\\cos(z/2)*\\cos(x/2))*\\sin(y/2)) \\\\
        ((\\cos(z/2)*\\sin(x/2))*\\sin(y/2))+((\\sin(z/2)*\\cos(x/2))*\\cos(y/2)) \\\\
    \\end{bmatrix} \\)`;

    // ZYX
    
    // -(-(sin(z/2)*sin(y/2))*sin(x/2))+((cos(z/2)*cos(y/2))*cos(x/2))
    // (-(sin(z/2)*sin(y/2))*cos(x/2))+((cos(z/2)*cos(y/2))*sin(x/2))
    // ((cos(z/2)*sin(y/2))*cos(x/2))+((sin(z/2)*cos(y/2))*sin(x/2))
    // -((cos(z/2)*sin(y/2))*sin(x/2))+((sin(z/2)*cos(y/2))*cos(x/2))

    var ZYX = `\\( \\begin{bmatrix} 
        -(-(\\sin(z/2)*\\sin(y/2))*\\sin(x/2))+((\\cos(z/2)*\\cos(y/2))*\\cos(x/2)) \\\\
        (-(\\sin(z/2)*\\sin(y/2))*\\cos(x/2))+((\\cos(z/2)*\\cos(y/2))*\\sin(x/2)) \\\\
        ((\\cos(z/2)*\\sin(y/2))*\\cos(x/2))+((\\sin(z/2)*\\cos(y/2))*\\sin(x/2)) \\\\
        -((\\cos(z/2)*\\sin(y/2))*\\sin(x/2))+((\\sin(z/2)*\\cos(y/2))*\\cos(x/2)) \\\\
    \\end{bmatrix} \\)`;

    switch(order.toString().toLowerCase()) {
        case 'xyz': return xText + yText + zText + eqText + XYZ;
        case 'xzy': return xText + zText + yText + eqText + XZY;
        case 'yxz': return yText + xText + zText + eqText + YXZ;
        case 'yzx': return yText + zText + xText + eqText + YZX;
        case 'zxy': return zText + xText + yText + eqText + ZXY;
        case 'zyx': return zText + yText + xText + eqText + ZYX;
        default: return null;
    }
}

function changeMathText() {
    var quatChoice = $('#quaternionMult').val();
    $('#quaternionMultiplicationText').html(QuaternionText(quatChoice));
    var math = document.getElementById("quaternionMultiplicationText");
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,math]);
}

function calculateQuaternions()
{
    var qA_w = parseFloat($("#qA_w").val());
    var qA_x = parseFloat($("#qA_x").val());
    var qA_y = parseFloat($("#qA_y").val());
    var qA_z = parseFloat($("#qA_z").val());
    var qB_w = parseFloat($("#qB_w").val());
    var qB_x = parseFloat($("#qB_x").val());
    var qB_y = parseFloat($("#qB_y").val());
    var qB_z = parseFloat($("#qB_z").val());
    var qA = new THREE.Quaternion().set(qA_x, qA_y, qA_z, qA_w);
    var qB = new THREE.Quaternion().set(qB_x, qB_y, qB_z, qB_w);

    var mA = new THREE.Matrix4().makeRotationFromQuaternion(qA);
    var mB = new THREE.Matrix4().makeRotationFromQuaternion(qB);

    var qC1 = new THREE.Quaternion().multiplyQuaternions(qA, qB);
    var mC1 = new THREE.Matrix4().makeRotationFromQuaternion(qC1);
    console.log('qC1')
    console.log(qC1);

    var qC1_text = '\\( \\begin{bmatrix} w = ' + qC1.w + '\\\\ x = ' + qC1.x + '\\\\ y = ' + qC1.y + '\\\\ z = ' + qC1.z + ' \\end{bmatrix} \\)';
    $('#calc_qX_1').html(qC1_text);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,$('#calc_qX_1')[0]]);

    var qA_conj = qA.clone().inverse();
    var qB_conj = qB.clone().inverse();

    // Pre-multiply X*A=B
    var qC2 = new THREE.Quaternion().multiplyQuaternions(qB, qA_conj);
    var mC2 = new THREE.Matrix4().makeRotationFromQuaternion(qC2);

    var qC2_text = '\\( \\begin{bmatrix} w = ' + qC2.w + '\\\\ x = ' + qC2.x + '\\\\ y = ' + qC2.y + '\\\\ z = ' + qC2.z + ' \\end{bmatrix} \\)';
    var qC2_check = new THREE.Quaternion().multiplyQuaternions(qC2, qA);
    var qC2_check_text = 'Check: {w = ' + qC2_check.w.toFixed(3) + ', x = ' + qC2_check.x.toFixed(3) + ', y = ' + qC2_check.y.toFixed(3) + ', z = ' + qC2_check.z.toFixed(3) + '}';
    var qC2_check_text_tex = '\\( \\begin{bmatrix} w = ' + qC2_check.w + '\\\\ x = ' + qC2_check.x + '\\\\ y = ' + qC2_check.y + '\\\\ z = ' + qC2_check.z + ' \\end{bmatrix} \\)';
    $('#calc_qX_2').html(qC2_text);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,$('#calc_qX_2')[0]]);

    // Post-multiply A*X=B
    var qC3 = new THREE.Quaternion().multiplyQuaternions(qA_conj, qB);
    var mC3 = new THREE.Matrix4().makeRotationFromQuaternion(qC3);

    var qC3_text = '\\( \\begin{bmatrix} w = ' + qC3.w + '\\\\ x = ' + qC3.x + '\\\\ y = ' + qC3.y + '\\\\ z = ' + qC3.z + ' \\end{bmatrix} \\)';
    var qC3_check = new THREE.Quaternion().multiplyQuaternions(qA, qC3);
    var qC3_check_text = 'Check: {w = ' + qC3_check.w.toFixed(3) + ', x = ' + qC3_check.x.toFixed(3) + ', y = ' + qC3_check.y.toFixed(3) + ', z = ' + qC3_check.z.toFixed(3) + '}';
    $('#calc_qX_3').html(qC3_text);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,$('#calc_qX_3')[0]]);

    $('#calc_mA').html(matrix4To3x3RotationTeXString(mA) + matrix4ToEulerAnglesTeXString(mA));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,$('#calc_mA')[0]]);
    $('#calc_mB').html(matrix4To3x3RotationTeXString(mB) + matrix4ToEulerAnglesTeXString(mB));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,$('#calc_mB')[0]]);
    $('#calc_mX_1').html(matrix4To3x3RotationTeXString(mC1) + matrix4ToEulerAnglesTeXString(mC1));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,$('#calc_mX_1')[0]]);
    $('#calc_mX_2').html(matrix4To3x3RotationTeXString(mC2) + matrix4ToEulerAnglesTeXString(mC2));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,$('#calc_mX_2')[0]]);
    $('#calc_mX_3').html(matrix4To3x3RotationTeXString(mC3) + matrix4ToEulerAnglesTeXString(mC3));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,$('#calc_mX_3')[0]]);
}

function matrix4ToEulerAngles(mat, order = 'XYZ')
{
    var s_pitch = 0.0;
    var c_pitch_1 = 0.0;
    var c_pitch_2 = 0.0;

    var c_roll_1 = 0.0;
    var c_roll_2 = 0.0;
    var c_yaw_1 = 0.0;
    var c_yaw_2 = 0.0;
    var s_roll_1 = 0.0;
    var s_roll_2 = 0.0;
    var s_yaw_1 = 0.0;
    var s_yaw_2 = 0.0;

    switch(order)
    {
        case 'XYZ': 
            s_pitch = mat.elements[8];
            if (s_pitch <= -0.9999999 || s_pitch >= 0.9999999)
            {
                console.log('Gimbal Lock');
                console.log(mat);
                var value = 90.0;
                if (s_pitch < 0.0) value = 270.0;
                var e1 = new THREE.Vector3().set(lastRotation.x * 180.0/Math.PI, value, lastRotation.z * 180.0/Math.PI);
                var e2 = new THREE.Vector3().set(lastRotation.x * 180.0/Math.PI, value, lastRotation.z * 180.0/Math.PI);
                e1 = MakeAnglePositive(e1);
                e2 = MakeAnglePositive(e2);
                return [e1, e2];
            }
            else {
                c_pitch_1 = Math.sqrt(mat.elements[9] * mat.elements[9] + mat.elements[10] * mat.elements[10]);
                c_pitch_2 = -1.0 * c_pitch_1;
    
                c_yaw_1 = mat.elements[10] / c_pitch_1;
                c_yaw_2 = mat.elements[10] / c_pitch_2;
                s_yaw_1 = mat.elements[9] * -1.0 / c_pitch_1;
                s_yaw_2 = mat.elements[9] * -1.0 / c_pitch_2;
    
                c_roll_1 = mat.elements[0] / c_pitch_1;
                c_roll_2 = mat.elements[0] / c_pitch_2;
                s_roll_1 = mat.elements[4] * -1.0 / c_pitch_1;
                s_roll_2 = mat.elements[4] * -1.0 / c_pitch_2;
            }

            break;
        case 'XZY': 
            s_pitch = -1.0 * mat.elements[1]; 
            c_pitch_1 = Math.sqrt(mat.elements[0] * mat.elements[0] + mat.elements[2] * mat.elements[2]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        case 'YXZ': 
            s_pitch = -1.0 * mat.elements[6];
            c_pitch_1 = Math.sqrt(mat.elements[4] * mat.elements[4] + mat.elements[5] * mat.elements[5]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        case 'YZX': 
            s_pitch = mat.elements[4];
            c_pitch_1 = Math.sqrt(mat.elements[0] * mat.elements[0] + mat.elements[8] * mat.elements[8]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        case 'ZXY': 
            s_pitch = mat.elements[9];
            c_pitch_1 = Math.sqrt(mat.elements[8] * mat.elements[8] + mat.elements[10] * mat.elements[10]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        case 'ZYX': 
            s_pitch = -1.0 * mat.elements[8];
            c_pitch_1 = Math.sqrt(mat.elements[9] * mat.elements[9] + mat.elements[10] * mat.elements[10]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        default: break;
    }

    var pitch1 = Math.atan2(s_pitch, c_pitch_1) * 180.0 / Math.PI;
    var yaw1 = Math.atan2(s_yaw_1, c_yaw_1) * 180.0 / Math.PI;
    var roll1 = Math.atan2(s_roll_1, c_roll_1) * 180.0 / Math.PI;

    var pitch2 = Math.atan2(s_pitch, c_pitch_2) * 180.0 / Math.PI;
    var yaw2 = Math.atan2(s_yaw_2, c_yaw_2) * 180.0 / Math.PI;
    var roll2 = Math.atan2(s_roll_2, c_roll_2) * 180.0 / Math.PI;

    var euler1 = new THREE.Vector3().set(yaw1, pitch1, roll1);
    var euler2 = new THREE.Vector3().set(yaw2, pitch2, roll2);
    euler1 = MakeAnglePositive(euler1);
    euler2 = MakeAnglePositive(euler2);
    return [euler1, euler2];
}

function matrix4To3x3RotationTeXString(mat)
{
    return '<div>\\( \\begin{bmatrix} '+
        mat.elements[0]+' & '+mat.elements[1]+' & '+mat.elements[2]+'\\\\'+
        mat.elements[4]+' & '+mat.elements[5]+' & '+mat.elements[6]+'\\\\'+
        mat.elements[8]+' & '+mat.elements[9]+' & '+mat.elements[10]+
        ' \\end {bmatrix} \\)</div>';
}

function matrix4ToEulerAnglesTeXString(mat, order = 'XYZ')
{
    var s_pitch = 0.0;
    var c_pitch_1 = 0.0;
    var c_pitch_2 = 0.0;

    var c_roll_1 = 0.0;
    var c_roll_2 = 0.0;
    var c_yaw_1 = 0.0;
    var c_yaw_2 = 0.0;
    var s_roll_1 = 0.0;
    var s_roll_2 = 0.0;
    var s_yaw_1 = 0.0;
    var s_yaw_2 = 0.0;

    switch(order)
    {
        case 'XYZ': 
            s_pitch = mat.elements[2];
            c_pitch_1 = Math.sqrt(mat.elements[0] * mat.elements[0] + mat.elements[1] * mat.elements[1]);
            c_pitch_2 = -1.0 * c_pitch_1;

            c_yaw_1 = mat.elements[10] / c_pitch_1;
            s_yaw_1 = mat.elements[6] * -1.0 / c_pitch_1;
            c_yaw_2 = mat.elements[10] / c_pitch_2;
            s_yaw_2 = mat.elements[6] * -1.0 / c_pitch_2;

            c_roll_1 = mat.elements[0] / c_pitch_1;
            s_roll_1 = mat.elements[1] * -1.0 / c_pitch_1;
            c_roll_2 = mat.elements[0] / c_pitch_2;
            s_roll_2 = mat.elements[1] * -1.0 / c_pitch_2;

            break;
        case 'XZY': 
            s_pitch = -1.0 * mat.elements[1]; 
            c_pitch_1 = Math.sqrt(mat.elements[0] * mat.elements[0] + mat.elements[2] * mat.elements[2]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        case 'YXZ': 
            s_pitch = -1.0 * mat.elements[6];
            c_pitch_1 = Math.sqrt(mat.elements[4] * mat.elements[4] + mat.elements[5] * mat.elements[5]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        case 'YZX': 
            s_pitch = mat.elements[4];
            c_pitch_1 = Math.sqrt(mat.elements[0] * mat.elements[0] + mat.elements[8] * mat.elements[8]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        case 'ZXY': 
            s_pitch = mat.elements[9];
            c_pitch_1 = Math.sqrt(mat.elements[8] * mat.elements[8] + mat.elements[10] * mat.elements[10]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        case 'ZYX': 
            s_pitch = -1.0 * mat.elements[8];
            c_pitch_1 = Math.sqrt(mat.elements[9] * mat.elements[9] + mat.elements[10] * mat.elements[10]);
            c_pitch_2 = -1.0 * c_pitch_1; 
            break;
        default: break;
    }

    var pitch1 = Math.atan2(s_pitch, c_pitch_1) * 180.0 / Math.PI;
    var roll1 = Math.atan2(s_yaw_1, c_yaw_1) * 180.0 / Math.PI;
    var yaw1 = Math.atan2(s_roll_1, c_roll_1) * 180.0 / Math.PI;
    var pitch2 = Math.atan2(s_pitch, c_pitch_2) * 180.0 / Math.PI;
    var roll2 = Math.atan2(s_yaw_2, c_yaw_2) * 180.0 / Math.PI;
    var yaw2 = Math.atan2(s_roll_2, c_roll_2) * 180.0 / Math.PI;

    var euler1 = new THREE.Euler().set(yaw1, pitch1, roll1);
    var euler2 = new THREE.Euler().set(yaw2, pitch2, roll2);
    var euler1Str = '\\( \\begin{bmatrix} '+yaw1+' & '+pitch1+' & '+roll1+' \\end{bmatrix} \\)';
    var euler2Str = '\\( \\begin{bmatrix} '+yaw2+' & '+pitch2+' & '+roll2+' \\end{bmatrix} \\)';

    return '<div>Euler A: ' + euler1Str + '</div><div>Euler B: ' + euler2Str + '</div>';
}

$(document).ready(function() {
    changeMathText();
});