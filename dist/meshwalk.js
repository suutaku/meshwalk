/*!
 * meshwalk
 * https://github.com/[object Object]
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CameraControls = {}, global.three));
})(this, (function (exports, three) { 'use strict';

	const vec3$2 = new three.Vector3();
	class ComputedTriangle extends three.Triangle {
	    constructor(a, b, c) {
	        super(a, b, c);
	        this.normal = this.getNormal(new three.Vector3());
	    }
	    computeBoundingSphere() {
	        this.boundingSphere = makeTriangleBoundingSphere(this, this.normal);
	    }
	    // https://math.stackexchange.com/questions/1397456/how-to-scale-a-triangle-such-that-the-distance-between-original-edges-and-new-ed
	    // scale( amount: number ) {
	    // 	const incenter = getIncenter( this, vec3 );
	    // 	this.a.sub( incenter ).multiplyScalar( amount ).add( incenter );
	    // 	this.b.sub( incenter ).multiplyScalar( amount ).add( incenter );
	    // 	this.c.sub( incenter ).multiplyScalar( amount ).add( incenter );
	    // 	拡張したら、過去の boundingSphere はすでに大きさが違うものとなる。破棄する。
	    // 	this.boundingSphere = undefined;
	    // }
	    extend(amount) {
	        const incenter = getIncenter(this, vec3$2);
	        const a = incenter.distanceTo(this.a);
	        const b = incenter.distanceTo(this.b);
	        const c = incenter.distanceTo(this.c);
	        this.a.sub(incenter).normalize().multiplyScalar(a + amount).add(incenter);
	        this.b.sub(incenter).normalize().multiplyScalar(b + amount).add(incenter);
	        this.c.sub(incenter).normalize().multiplyScalar(c + amount).add(incenter);
	        // 拡張したら、過去の boundingSphere はすでに大きさが違うものとなる。破棄する。
	        this.boundingSphere = undefined;
	    }
	}
	// aka Semiperimeter
	function getIncenter(triangle, out) {
	    // https://byjus.com/maths/incenter-of-a-triangle/
	    const a = triangle.a.distanceTo(triangle.b);
	    const b = triangle.b.distanceTo(triangle.c);
	    const c = triangle.c.distanceTo(triangle.a);
	    const p = a + b + c;
	    out.set((a * triangle.a.x + b * triangle.b.x + c * triangle.c.x) / p, (a * triangle.a.y + b * triangle.b.y + c * triangle.c.y) / p, (a * triangle.a.z + b * triangle.b.z + c * triangle.c.z) / p);
	    return out;
	}
	// const edge = new Line3();
	// function getInradius( triangle: Triangle ) {
	// 	const incenter = getIncenter( triangle, vec3 );
	// 	const closestPointToEdge = new Vector3();
	// 	edge.start = triangle.a;
	// 	edge.end = triangle.b;
	// 	edge.closestPointToPoint( incenter, true, closestPointToEdge );
	// 	return incenter.distanceTo( closestPointToEdge );
	// }
	// function makeTriangleBoundingBox( triangle: Triangle ) {
	// 	const bb = new Box3();
	// 	bb.min = bb.min.min( triangle.a );
	// 	bb.min = bb.min.min( triangle.b );
	// 	bb.min = bb.min.min( triangle.c );
	// 	bb.max = bb.max.max( triangle.a );
	// 	bb.max = bb.max.max( triangle.b );
	// 	bb.max = bb.max.max( triangle.c );
	// 	return bb;
	// }
	const v = new three.Vector3();
	const v0 = new three.Vector3();
	const v1 = new three.Vector3();
	const e0 = new three.Vector3();
	const e1 = new three.Vector3();
	const triangleNormal = new three.Vector3();
	function makeTriangleBoundingSphere(triangle, normal) {
	    const bs = new three.Sphere();
	    // obtuse triangle
	    v0.subVectors(triangle.b, triangle.a);
	    v1.subVectors(triangle.c, triangle.a);
	    if (v0.dot(v1) <= 0) {
	        bs.center.addVectors(triangle.b, triangle.c).divideScalar(2);
	        bs.radius = v.subVectors(triangle.b, triangle.c).length() / 2;
	        return bs;
	    }
	    v0.subVectors(triangle.a, triangle.b);
	    v1.subVectors(triangle.c, triangle.b);
	    if (v0.dot(v1) <= 0) {
	        bs.center.addVectors(triangle.a, triangle.c).divideScalar(2);
	        bs.radius = v.subVectors(triangle.a, triangle.c).length() / 2;
	        return bs;
	    }
	    v0.subVectors(triangle.a, triangle.c);
	    v1.subVectors(triangle.b, triangle.c);
	    if (v0.dot(v1) <= 0) {
	        bs.center.addVectors(triangle.a, triangle.b).divideScalar(2);
	        bs.radius = v.subVectors(triangle.a, triangle.b).length() / 2;
	        return bs;
	    }
	    // acute‐angled triangle
	    if (!normal) {
	        normal = triangle.getNormal(triangleNormal);
	    }
	    v0.crossVectors(v.subVectors(triangle.c, triangle.b), normal);
	    v1.crossVectors(v.subVectors(triangle.c, triangle.a), normal);
	    e0.addVectors(triangle.c, triangle.b).multiplyScalar(.5);
	    e1.addVectors(triangle.c, triangle.a).multiplyScalar(.5);
	    const a = v0.dot(v1);
	    const b = v0.dot(v0);
	    const d = v1.dot(v1);
	    const c = -v.subVectors(e1, e0).dot(v0);
	    const e = -v.subVectors(e1, e0).dot(v1);
	    const div = -a * a + b * d;
	    // t = ( - a * c + b * e ) / div;
	    const s = (-c * d + a * e) / div;
	    bs.center = e0.clone().add(v0.clone().multiplyScalar(s));
	    bs.radius = v.subVectors(bs.center, triangle.a).length();
	    return bs;
	}

	const vec3$1 = new three.Vector3();
	// https://3dkingdoms.com/weekly/weekly.php?a=3
	function intersectsLineBox(line, box, hit) {
	    if (line.end.x < box.min.x && line.start.x < box.min.x)
	        return false;
	    if (line.end.x > box.max.x && line.start.x > box.max.x)
	        return false;
	    if (line.end.y < box.min.y && line.start.y < box.min.y)
	        return false;
	    if (line.end.y > box.max.y && line.start.y > box.max.y)
	        return false;
	    if (line.end.z < box.min.z && line.start.z < box.min.z)
	        return false;
	    if (line.end.z > box.max.z && line.start.z > box.max.z)
	        return false;
	    if (line.start.x > box.min.x && line.start.x < box.max.x &&
	        line.start.y > box.min.y && line.start.y < box.max.y &&
	        line.start.z > box.min.z && line.start.z < box.max.z) {
	        hit && hit.copy(line.start);
	        return true;
	    }
	    const _hit = vec3$1;
	    if ((getIntersection(line.start.x - box.min.x, line.end.x - box.min.x, line.start, line.end, _hit) && inBox(_hit, box, 1)) ||
	        (getIntersection(line.start.y - box.min.y, line.end.y - box.min.y, line.start, line.end, _hit) && inBox(_hit, box, 2)) ||
	        (getIntersection(line.start.z - box.min.z, line.end.z - box.min.z, line.start, line.end, _hit) && inBox(_hit, box, 3)) ||
	        (getIntersection(line.start.x - box.max.x, line.end.x - box.max.x, line.start, line.end, _hit) && inBox(_hit, box, 1)) ||
	        (getIntersection(line.start.y - box.max.y, line.end.y - box.max.y, line.start, line.end, _hit) && inBox(_hit, box, 2)) ||
	        (getIntersection(line.start.z - box.max.z, line.end.z - box.max.z, line.start, line.end, _hit) && inBox(_hit, box, 3))) {
	        hit && hit.copy(_hit);
	        return true;
	    }
	    return false;
	}
	function getIntersection(dst1, dst2, p1, p2, hit) {
	    if ((dst1 * dst2) >= 0)
	        return false;
	    if (dst1 == dst2)
	        return false;
	    if (hit) {
	        vec3$1.subVectors(p2, p1);
	        vec3$1.multiplyScalar(-dst1 / (dst2 - dst1));
	        hit.addVectors(p1, vec3$1);
	    }
	    return true;
	}
	function inBox(hit, box, axis) {
	    if (axis === 1 && hit.z > box.min.z && hit.z < box.max.z && hit.y > box.min.y && hit.y < box.max.y)
	        return true;
	    if (axis === 2 && hit.z > box.min.z && hit.z < box.max.z && hit.x > box.min.x && hit.x < box.max.x)
	        return true;
	    if (axis === 3 && hit.x > box.min.x && hit.x < box.max.x && hit.y > box.min.y && hit.y < box.max.y)
	        return true;
	    return false;
	}

	const vec3 = new three.Vector3();
	// // based on Real-Time Collision Detection Section 5.3.4
	// // p: <THREE.Vector3>, // line3.start
	// // q: <THREE.Vector3>, // line3.end
	// // a: <THREE.Vector3>, // triangle.a
	// // b: <THREE.Vector3>, // triangle.b
	// // c: <THREE.Vector3>, // triangle.c
	// const pq = new Vector3();
	// const pa = new Vector3();
	// const pb = new Vector3();
	// const pc = new Vector3();
	// const au = new Vector3();
	// const bv = new Vector3();
	// const cw = new Vector3();
	// export function intersectsLineTriangle( p: Vector3, q: Vector3, a: Vector3, b: Vector3, c: Vector3, hit: Vector3 ) {
	// 	pq.subVectors( q, p );
	// 	pa.subVectors( a, p );
	// 	pb.subVectors( b, p );
	// 	pc.subVectors( c, p );
	// 	let u: number;
	// 	let v: number;
	// 	let w: number;
	// 	u = scalarTriple( pq, pc, pb );
	// 	if ( u < 0 ) return false;
	// 	v = scalarTriple( pq, pa, pc );
	// 	if ( v < 0 ) return false;
	// 	w = scalarTriple( pq, pb, pa );
	// 	if ( w < 0 ) return false;
	// 	const denom = 1 / ( u + v + w );
	// 	u *= denom;
	// 	v *= denom;
	// 	w *= denom;
	// 	au.copy( a ).multiplyScalar( u );
	// 	bv.copy( b ).multiplyScalar( v );
	// 	cw.copy( c ).multiplyScalar( w );
	// 	hit.copy( au ).add( bv ).add( cw );
	// 	return true;
	// }
	// function scalarTriple( a: Vector3, b: Vector3, c: Vector3 ) {
	// 	var m = b.clone().cross( c );
	// 	return a.dot( m );
	// }
	// var vectorTriple = function ( a, b, c ) {
	//   var m = b.clone().cross( c );
	//   return a.clone().cross( m );
	// }
	const ab = new three.Vector3();
	const ac = new three.Vector3();
	const qp = new three.Vector3();
	const n = new three.Vector3();
	const ap = new three.Vector3();
	const e = new three.Vector3();
	const au = new three.Vector3();
	const bv = new three.Vector3();
	const cw = new three.Vector3();
	function intersectsLineTriangle(p, q, a, b, c, hit) {
	    ab.subVectors(b, a);
	    ac.subVectors(c, a);
	    qp.subVectors(p, q);
	    n.copy(ab).cross(ac);
	    const d = qp.dot(n);
	    if (d <= 0)
	        return false;
	    ap.subVectors(p, a);
	    let t = ap.dot(n);
	    if (t < 0)
	        return false;
	    if (t > d)
	        return false;
	    e.copy(qp).cross(ap);
	    let v = ac.dot(e);
	    if (v < 0 || v > d)
	        return false;
	    let w = vec3.copy(ab).dot(e) * -1;
	    if (w < 0 || v + w > d)
	        return false;
	    const ood = 1 / d;
	    t *= ood;
	    v *= ood;
	    w *= ood;
	    const u = 1 - v - w;
	    au.copy(a).multiplyScalar(u);
	    bv.copy(b).multiplyScalar(v);
	    cw.copy(c).multiplyScalar(w);
	    hit.copy(au).add(bv).add(cw);
	    return true;
	}

	const _v1 = new three.Vector3();
	const _v2$1 = new three.Vector3();
	// const _plane = new Plane();
	// const _line1 = new Line3();
	// const _line2 = new Line3();
	// const _sphere = new Sphere();
	// const _capsule = new Capsule();
	class Octree {
	    constructor(box = new three.Box3()) {
	        this.bounds = new three.Box3();
	        this.triangles = [];
	        this.subTrees = [];
	        this.box = box;
	    }
	    addTriangle(triangle) {
	        this.bounds.min.x = Math.min(this.bounds.min.x, triangle.a.x, triangle.b.x, triangle.c.x);
	        this.bounds.min.y = Math.min(this.bounds.min.y, triangle.a.y, triangle.b.y, triangle.c.y);
	        this.bounds.min.z = Math.min(this.bounds.min.z, triangle.a.z, triangle.b.z, triangle.c.z);
	        this.bounds.max.x = Math.max(this.bounds.max.x, triangle.a.x, triangle.b.x, triangle.c.x);
	        this.bounds.max.y = Math.max(this.bounds.max.y, triangle.a.y, triangle.b.y, triangle.c.y);
	        this.bounds.max.z = Math.max(this.bounds.max.z, triangle.a.z, triangle.b.z, triangle.c.z);
	        this.triangles.push(triangle);
	    }
	    calcBox() {
	        this.box.set(this.bounds.min, this.bounds.max);
	        // offset small amount to account for regular grid
	        this.box.min.x -= 0.01;
	        this.box.min.y -= 0.01;
	        this.box.min.z -= 0.01;
	        return this;
	    }
	    split(level) {
	        const subTrees = [];
	        const halfSize = _v2$1.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
	        for (let x = 0; x < 2; x++) {
	            for (let y = 0; y < 2; y++) {
	                for (let z = 0; z < 2; z++) {
	                    const box = new three.Box3();
	                    const v = _v1.set(x, y, z);
	                    box.min.copy(this.box.min).add(v.multiply(halfSize));
	                    box.max.copy(box.min).add(halfSize);
	                    subTrees.push(new Octree(box));
	                }
	            }
	        }
	        let triangle;
	        while (triangle = this.triangles.pop()) {
	            for (let i = 0; i < subTrees.length; i++) {
	                if (subTrees[i].box.intersectsTriangle(triangle)) {
	                    subTrees[i].triangles.push(triangle);
	                }
	            }
	        }
	        for (let i = 0; i < subTrees.length; i++) {
	            const len = subTrees[i].triangles.length;
	            if (len > 8 && level < 16) {
	                subTrees[i].split(level + 1);
	            }
	            if (len !== 0) {
	                this.subTrees.push(subTrees[i]);
	            }
	        }
	    }
	    build() {
	        this.calcBox();
	        this.split(0);
	        return this;
	    }
	    getLineTriangles(line, result) {
	        for (let i = 0; i < this.subTrees.length; i++) {
	            const subTree = this.subTrees[i];
	            if (!intersectsLineBox(line, subTree.box))
	                continue;
	            if (subTree.triangles.length > 0) {
	                for (let j = 0; j < subTree.triangles.length; j++) {
	                    if (result.indexOf(subTree.triangles[j]) === -1)
	                        result.push(subTree.triangles[j]);
	                }
	            }
	            else {
	                subTree.getLineTriangles(line, result);
	            }
	        }
	        return result;
	    }
	    getRayTriangles(ray, result) {
	        for (let i = 0; i < this.subTrees.length; i++) {
	            const subTree = this.subTrees[i];
	            if (!ray.intersectsBox(subTree.box))
	                continue;
	            if (subTree.triangles.length > 0) {
	                for (let j = 0; j < subTree.triangles.length; j++) {
	                    if (result.indexOf(subTree.triangles[j]) === -1)
	                        result.push(subTree.triangles[j]);
	                }
	            }
	            else {
	                subTree.getRayTriangles(ray, result);
	            }
	        }
	        return result;
	    }
	    getSphereTriangles(sphere, result) {
	        for (let i = 0; i < this.subTrees.length; i++) {
	            const subTree = this.subTrees[i];
	            if (!sphere.intersectsBox(subTree.box))
	                continue;
	            if (subTree.triangles.length > 0) {
	                for (let j = 0; j < subTree.triangles.length; j++) {
	                    if (result.indexOf(subTree.triangles[j]) === -1)
	                        result.push(subTree.triangles[j]);
	                }
	            }
	            else {
	                subTree.getSphereTriangles(sphere, result);
	            }
	        }
	        return result;
	    }
	    getCapsuleTriangles(capsule, result) {
	        for (let i = 0; i < this.subTrees.length; i++) {
	            const subTree = this.subTrees[i];
	            if (!capsule.intersectsBox(subTree.box))
	                continue;
	            if (subTree.triangles.length > 0) {
	                for (let j = 0; j < subTree.triangles.length; j++) {
	                    if (result.indexOf(subTree.triangles[j]) === -1)
	                        result.push(subTree.triangles[j]);
	                }
	            }
	            else {
	                subTree.getCapsuleTriangles(capsule, result);
	            }
	        }
	    }
	    lineIntersect(line) {
	        const position = new three.Vector3();
	        const triangles = [];
	        let distanceSquared = Infinity;
	        let triangle = null;
	        this.getLineTriangles(line, triangles);
	        for (let i = 0; i < triangles.length; i++) {
	            const result = _v1;
	            const isIntersected = intersectsLineTriangle(line.start, line.end, triangles[i].a, triangles[i].b, triangles[i].c, result);
	            if (isIntersected) {
	                const newDistanceSquared = line.start.distanceToSquared(result);
	                if (distanceSquared > newDistanceSquared) {
	                    position.copy(result);
	                    distanceSquared = newDistanceSquared;
	                    triangle = triangles[i];
	                }
	            }
	        }
	        return triangle ? { distance: Math.sqrt(distanceSquared), triangle, position } : false;
	    }
	    rayIntersect(ray) {
	        if (ray.direction.lengthSq() === 0)
	            return;
	        const triangles = [];
	        let triangle, position, distanceSquared = 1e100;
	        this.getRayTriangles(ray, triangles);
	        for (let i = 0; i < triangles.length; i++) {
	            const result = ray.intersectTriangle(triangles[i].a, triangles[i].b, triangles[i].c, true, _v1);
	            if (result) {
	                const newDistanceSquared = result.sub(ray.origin).lengthSq();
	                if (distanceSquared > newDistanceSquared) {
	                    position = result.clone().add(ray.origin);
	                    distanceSquared = newDistanceSquared;
	                    triangle = triangles[i];
	                }
	            }
	        }
	        return distanceSquared < 1e100 ? { distance: Math.sqrt(distanceSquared), triangle, position } : false;
	    }
	    addGraphNode(object) {
	        object.updateWorldMatrix(true, true);
	        object.traverse((childObject) => {
	            if (childObject instanceof three.Mesh) {
	                const mesh = childObject;
	                const geometry = mesh.geometry.clone();
	                geometry.applyMatrix4(mesh.matrix);
	                geometry.computeVertexNormals();
	                if (!!geometry.index) {
	                    const indices = geometry.index.array;
	                    const positions = geometry.attributes.position.array;
	                    const groups = (geometry.groups.length !== 0) ? geometry.groups : [{ start: 0, count: indices.length, materialIndex: 0 }];
	                    for (let i = 0, l = groups.length; i < l; ++i) {
	                        const start = groups[i].start;
	                        const count = groups[i].count;
	                        for (let ii = start, ll = start + count; ii < ll; ii += 3) {
	                            const a = indices[ii];
	                            const b = indices[ii + 1];
	                            const c = indices[ii + 2];
	                            const vA = new three.Vector3().fromArray(positions, a * 3);
	                            const vB = new three.Vector3().fromArray(positions, b * 3);
	                            const vC = new three.Vector3().fromArray(positions, c * 3);
	                            const triangle = new ComputedTriangle(vA, vB, vC);
	                            // ポリゴンの継ぎ目の辺で raycast が交差しない可能性があるので、わずかに拡大する
	                            triangle.extend(1e-10);
	                            triangle.computeBoundingSphere();
	                            this.addTriangle(triangle);
	                        }
	                    }
	                }
	            }
	        });
	        this.build();
	    }
	}

	let EventDispatcher$1 = class EventDispatcher {
	    constructor() {
	        this._listeners = {};
	    }
	    /**
	     * Adds the specified event listener.
	     * @param type event name
	     * @param listener handler function
	     * @category Methods
	     */
	    addEventListener(type, listener) {
	        const listeners = this._listeners;
	        if (listeners[type] === undefined)
	            listeners[type] = [];
	        if (listeners[type].indexOf(listener) === -1)
	            listeners[type].push(listener);
	    }
	    /**
	     * Presence of the specified event listener.
	     * @param type event name
	     * @param listener handler function
	     * @category Methods
	     */
	    hasEventListener(type, listener) {
	        const listeners = this._listeners;
	        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
	    }
	    /**
	     * Removes the specified event listener
	     * @param type event name
	     * @param listener handler function
	     * @category Methods
	     */
	    removeEventListener(type, listener) {
	        const listeners = this._listeners;
	        const listenerArray = listeners[type];
	        if (listenerArray !== undefined) {
	            const index = listenerArray.indexOf(listener);
	            if (index !== -1)
	                listenerArray.splice(index, 1);
	        }
	    }
	    /**
	     * Fire an event type.
	     * @param event DispatcherEvent
	     * @category Methods
	     */
	    dispatchEvent(event) {
	        const listeners = this._listeners;
	        const listenerArray = listeners[event.type];
	        if (listenerArray !== undefined) {
	            event.target = this;
	            const array = listenerArray.slice(0);
	            for (let i = 0, l = array.length; i < l; i++) {
	                array[i].call(this, event);
	            }
	        }
	    }
	};

	class Intersection {
	    constructor() {
	        this.point = new three.Vector3();
	        this.normal = new three.Vector3();
	        this.depth = 0;
	    }
	    set(point, normal, depth) {
	        this.point.copy(point);
	        this.normal.copy(normal);
	        this.depth = depth;
	    }
	}

	const vec3_0 = new three.Vector3();
	const vec3_1 = new three.Vector3();
	const A = new three.Vector3();
	const B = new three.Vector3();
	const C = new three.Vector3();
	const V = new three.Vector3();
	const AB = new three.Vector3();
	const BC = new three.Vector3();
	const CA = new three.Vector3();
	const Q1 = new three.Vector3();
	const Q2 = new three.Vector3();
	const Q3 = new three.Vector3();
	const QC = new three.Vector3();
	const QA = new three.Vector3();
	const QB = new three.Vector3();
	const negatedNormal = new three.Vector3();
	// Sphere vs Triangle
	// 1. Triangle から Plane をつくる
	// 2. Sphere の中心から Plane の距離を求める
	// 3. 距離が Sphere の半径よりも大きければ、交差していないので return null
	// 4. Sphere の中心を通る、Plane からの垂線の、Plane 上の座標を求める
	// 5. その座標が Triangle の内側にあれば、交差している。return { position: 交差座標、 normal: triangle の法線、depth: 半径 - 距離 }
	// 6. 外側の場合、Triangle の3つの辺（セグメント）と、Sphere との最近距離を求める
	// 7. 最近距離が半径よりも大きければ、交差していないので return null
	// 8. 交差している場合、最も近い辺の、セグメント上の最近距離のを求める。return { position: 交差座標、 normal: 点と中心の方向ベクトル、depth: 半径 - 距離 }
	// 9. 例外は return null
	//
	// sphere: <THREE.Sphere>
	// a: <THREE.Vector3>, // vertex of a triangle
	// b: <THREE.Vector3>, // vertex of a triangle
	// c: <THREE.Vector3>, // vertex of a triangle
	// normal: <THREE.Vector3>, // normal of a triangle
	function intersectsSphereTriangle(sphere, a, b, c, normal, out) {
	    // http://realtimecollisiondetection.net/blog/?p=103
	    // vs plain of triangle face
	    A.subVectors(a, sphere.center);
	    B.subVectors(b, sphere.center);
	    C.subVectors(c, sphere.center);
	    const rr = sphere.radius * sphere.radius;
	    V.crossVectors(vec3_0.subVectors(B, A), vec3_1.subVectors(C, A));
	    const d = A.dot(V);
	    const e = V.dot(V);
	    if (d * d > rr * e) {
	        return false;
	    }
	    // vs triangle vertex
	    const aa = A.dot(A);
	    const ab = A.dot(B);
	    const ac = A.dot(C);
	    const bb = B.dot(B);
	    const bc = B.dot(C);
	    const cc = C.dot(C);
	    if ((aa > rr) && (ab > aa) && (ac > aa) ||
	        (bb > rr) && (ab > bb) && (bc > bb) ||
	        (cc > rr) && (ac > cc) && (bc > cc)) {
	        return false;
	    }
	    // vs edge
	    AB.subVectors(B, A);
	    BC.subVectors(C, B);
	    CA.subVectors(A, C);
	    const d1 = ab - aa;
	    const d2 = bc - bb;
	    const d3 = ac - cc;
	    const e1 = AB.dot(AB);
	    const e2 = BC.dot(BC);
	    const e3 = CA.dot(CA);
	    Q1.subVectors(A.multiplyScalar(e1), AB.multiplyScalar(d1));
	    Q2.subVectors(B.multiplyScalar(e2), BC.multiplyScalar(d2));
	    Q3.subVectors(C.multiplyScalar(e3), CA.multiplyScalar(d3));
	    QC.subVectors(C.multiplyScalar(e1), Q1);
	    QA.subVectors(A.multiplyScalar(e2), Q2);
	    QB.subVectors(B.multiplyScalar(e3), Q3);
	    if ((Q1.dot(Q1) > rr * e1 * e1) && (Q1.dot(QC) >= 0) ||
	        (Q2.dot(Q2) > rr * e2 * e2) && (Q2.dot(QA) >= 0) ||
	        (Q3.dot(Q3) > rr * e3 * e3) && (Q3.dot(QB) >= 0)) {
	        return false;
	    }
	    const distance = Math.sqrt(d * d / e) - sphere.radius - 1;
	    negatedNormal.set(-normal.x, -normal.y, -normal.z);
	    const contactPoint = sphere.center.clone().add(negatedNormal.multiplyScalar(distance));
	    out.set(contactPoint, normal, distance);
	    return true;
	}

	const FALL_VELOCITY = -20;
	const JUMP_DURATION = 1000;
	const PI_HALF$1 = Math.PI * 0.5;
	const PI_ONE_HALF = Math.PI * 1.5;
	const direction2D = new three.Vector2();
	const wallNormal2D = new three.Vector2();
	const groundingHead = new three.Vector3();
	const groundingTo = new three.Vector3();
	const groundContactPointTmp = new three.Vector3();
	const groundContactPoint = new three.Vector3();
	// const point1 = new Vector3();
	// const point2 = new Vector3();
	// const direction = new Vector3();
	// const translateScoped = new Vector3();
	const translate = new three.Vector3();
	const sphereCenter = new three.Vector3();
	const sphere$1 = new three.Sphere();
	const intersection = new Intersection();
	class CharacterController extends EventDispatcher$1 {
	    constructor(object3d, radius) {
	        super();
	        this.isCharacterController = true;
	        this.position = new three.Vector3();
	        this.groundCheckDepth = .2;
	        this.maxSlopeGradient = Math.cos(50 * three.MathUtils.DEG2RAD);
	        this.isGrounded = false;
	        this.isOnSlope = false;
	        this.isIdling = false;
	        this.isRunning = false;
	        this.isJumping = false;
	        this.direction = 0; // 0 to 2PI (= 360deg) in rad
	        this.movementSpeed = 10; // Meters Per Second
	        this.velocity = new three.Vector3(0, -9.8, 0);
	        this.currentJumpPower = 0;
	        this.jumpStartTime = 0;
	        this.groundHeight = 0;
	        this.groundNormal = new three.Vector3();
	        this.nearTriangles = [];
	        this.contactInfo = [];
	        this.object = object3d;
	        this.radius = radius;
	        this.position.set(0, 0, 0);
	        let isFirstUpdate = true;
	        let wasGrounded = false;
	        let wasOnSlope = false;
	        // let wasIdling = false;
	        let wasRunning = false;
	        let wasJumping = false;
	        this._events = () => {
	            // 初回のみ、過去状態を作るだけで終わり
	            if (isFirstUpdate) {
	                isFirstUpdate = false;
	                wasGrounded = this.isGrounded;
	                wasOnSlope = this.isOnSlope;
	                // wasIdling   = this.isIdling;
	                wasRunning = this.isRunning;
	                wasJumping = this.isJumping;
	                return;
	            }
	            if (!wasRunning && !this.isRunning && this.isGrounded && !this.isIdling) {
	                this.isIdling = true;
	                this.dispatchEvent({ type: 'startIdling' });
	            }
	            else if ((!wasRunning && this.isRunning && !this.isJumping && this.isGrounded) ||
	                (!wasGrounded && this.isGrounded && this.isRunning) ||
	                (wasOnSlope && !this.isOnSlope && this.isRunning && this.isGrounded)) {
	                this.isIdling = false;
	                this.dispatchEvent({ type: 'startWalking' });
	            }
	            else if (!wasJumping && this.isJumping) {
	                this.isIdling = false;
	                this.dispatchEvent({ type: 'startJumping' });
	            }
	            else if (!wasOnSlope && this.isOnSlope) {
	                this.dispatchEvent({ type: 'startSliding' });
	            }
	            else if (wasGrounded && !this.isGrounded && !this.isJumping) {
	                this.dispatchEvent({ type: 'startFalling' });
	            }
	            if (!wasGrounded && this.isGrounded) ;
	            wasGrounded = this.isGrounded;
	            wasOnSlope = this.isOnSlope;
	            // wasIdling   = this.isIdling;
	            wasRunning = this.isRunning;
	            wasJumping = this.isJumping;
	        };
	    }
	    setNearTriangles(nearTriangles) {
	        this.nearTriangles = nearTriangles;
	    }
	    update(deltaTime) {
	        // 状態をリセットしておく
	        this.isGrounded = false;
	        this.isOnSlope = false;
	        this.groundHeight = -Infinity;
	        this.groundNormal.set(0, 1, 0);
	        this._checkGround();
	        this._updateJumping();
	        this._updatePosition(deltaTime);
	        this._collisionDetection();
	        this._solvePosition();
	        this._updateVelocity();
	        this._events();
	    }
	    _updateVelocity() {
	        const frontDirection = -Math.cos(this.direction);
	        const rightDirection = -Math.sin(this.direction);
	        let isHittingCeiling = false;
	        this.velocity.set(this.isRunning ? rightDirection * this.movementSpeed : 0, FALL_VELOCITY, this.isRunning ? frontDirection * this.movementSpeed : 0);
	        // 急勾配や自由落下など、自動で付与される速度の処理
	        if (this.contactInfo.length === 0 && !this.isJumping) {
	            // 何とも衝突していないので、自由落下
	            return;
	        }
	        else if (this.isGrounded && !this.isOnSlope && !this.isJumping) {
	            // 通常の地面上にいる場合、ただしジャンプ開始時は除く
	            this.velocity.y = 0;
	        }
	        else if (this.isOnSlope) {
	            // TODO 0.2 はマジックナンバーなので、幾何学的な求め方を考える
	            const slidingDownVelocity = FALL_VELOCITY;
	            const horizontalSpeed = -slidingDownVelocity / (1 - this.groundNormal.y) * 0.2;
	            this.velocity.x = this.groundNormal.x * horizontalSpeed;
	            this.velocity.y = FALL_VELOCITY;
	            this.velocity.z = this.groundNormal.z * horizontalSpeed;
	        }
	        else if (!this.isGrounded && !this.isOnSlope && this.isJumping) {
	            // ジャンプの処理
	            this.velocity.y = this.currentJumpPower * -FALL_VELOCITY;
	        }
	        // 壁に向かった場合、壁方向の速度を0にする処理
	        // vs walls and sliding on the wall
	        direction2D.set(rightDirection, frontDirection);
	        // const frontAngle = Math.atan2( direction2D.y, direction2D.x );
	        const negativeFrontAngle = Math.atan2(-direction2D.y, -direction2D.x);
	        for (let i = 0, l = this.contactInfo.length; i < l; i++) {
	            const normal = this.contactInfo[i].triangle.normal;
	            // var distance = this.contactInfo[ i ].distance;
	            if (this.maxSlopeGradient < normal.y || this.isOnSlope) {
	                // フェイスは地面なので、壁としての衝突の可能性はない。
	                // 速度の減衰はしないでいい
	                continue;
	            }
	            if (!isHittingCeiling && normal.y < 0) {
	                isHittingCeiling = true;
	            }
	            wallNormal2D.set(normal.x, normal.z).normalize();
	            const wallAngle = Math.atan2(wallNormal2D.y, wallNormal2D.x);
	            if (Math.abs(negativeFrontAngle - wallAngle) >= PI_HALF$1 && //  90deg
	                Math.abs(negativeFrontAngle - wallAngle) <= PI_ONE_HALF // 270deg
	            ) {
	                // フェイスは進行方向とは逆方向、要は背中側の壁なので
	                // 速度の減衰はしないでいい
	                continue;
	            }
	            // 上記までの条件に一致しなければ、フェイスは壁
	            // 壁の法線を求めて、その逆方向に向いている速度ベクトルを0にする
	            wallNormal2D.set(direction2D.dot(wallNormal2D) * wallNormal2D.x, direction2D.dot(wallNormal2D) * wallNormal2D.y);
	            direction2D.sub(wallNormal2D);
	            this.velocity.x = this.isRunning ? direction2D.x * this.movementSpeed : 0;
	            this.velocity.z = this.isRunning ? direction2D.y * this.movementSpeed : 0;
	        }
	        // ジャンプ中に天井にぶつかったら、ジャンプを中断する
	        if (isHittingCeiling) {
	            this.velocity.y = Math.min(0, this.velocity.y);
	            this.isJumping = false;
	        }
	    }
	    _checkGround() {
	        // "頭上からほぼ無限に下方向までの線 (segment)" vs "フェイス (triangle)" の
	        // 交差判定を行う
	        // もし、フェイスとの交差点が「頭上」から「下 groundCheckDepth」までの間だったら
	        // 地面上 (isGrounded) にいることとみなす
	        //
	        //   ___
	        //  / | \
	        // |  |  | player sphere
	        //  \_|_/
	        //    |
	        //---[+]---- ground
	        //    |
	        //    |
	        //    | segment (player's head to almost -infinity)
	        let groundContact = null;
	        const triangles = this.nearTriangles;
	        groundingHead.set(this.position.x, this.position.y + this.radius * 2, this.position.z);
	        groundingTo.set(this.position.x, this.position.y - 1e1, this.position.z);
	        for (let i = 0, l = triangles.length; i < l; i++) {
	            const triangle = triangles[i];
	            // 壁・天井は接地処理では無視
	            if (triangle.normal.y <= 0)
	                continue;
	            const isIntersected = intersectsLineTriangle(groundingHead, groundingTo, triangle.a, triangle.b, triangle.c, groundContactPointTmp);
	            if (!isIntersected)
	                continue;
	            if (!groundContact) {
	                groundContactPoint.copy(groundContactPointTmp);
	                groundContact = {
	                    point: groundContactPoint,
	                    ground: triangle,
	                };
	                continue;
	            }
	            if (groundContactPointTmp.y <= groundContact.point.y)
	                continue;
	            groundContactPoint.copy(groundContactPointTmp);
	            groundContact = {
	                point: groundContactPoint,
	                ground: triangle,
	            };
	        }
	        if (!groundContact)
	            return;
	        this.groundHeight = groundContact.point.y;
	        this.groundNormal.copy(groundContact.ground.normal);
	        // その他、床の属性を追加で取得する場合はここで
	        const top = groundingHead.y;
	        const bottom = this.position.y - this.groundCheckDepth;
	        // ジャンプ中、かつ上方向に移動中だったら、強制接地しない
	        if (this.isJumping && 0 < this.currentJumpPower) {
	            this.isOnSlope = false;
	            this.isGrounded = false;
	            return;
	        }
	        this.isGrounded = (bottom <= this.groundHeight && this.groundHeight <= top);
	        this.isOnSlope = (this.groundNormal.y <= this.maxSlopeGradient);
	        if (this.isGrounded) {
	            this.isJumping = false;
	        }
	    }
	    _updatePosition(deltaTime) {
	        // 壁などを無視してひとまず(速度 * 時間)だけ
	        // position の座標を進める
	        // 壁との衝突判定はこのこの後のステップで行うのでここではやらない
	        // もし isGrounded 状態なら、強制的に y の値を地面に合わせる
	        this.position.set(this.position.x + this.velocity.x * deltaTime, this.isGrounded ? this.groundHeight : this.position.y + this.velocity.y * deltaTime, this.position.z + this.velocity.z * deltaTime);
	    }
	    _collisionDetection() {
	        sphereCenter.set(0, this.radius, 0).add(this.position);
	        sphere$1.set(sphereCenter, this.radius);
	        // 交差していそうなフェイス (nearTriangles) のリストから、
	        // 実際に交差している壁フェイスを抜き出して
	        // this.contactInfo に追加する
	        const triangles = this.nearTriangles;
	        this.contactInfo.length = 0;
	        for (let i = 0, l = triangles.length; i < l; i++) {
	            const triangle = triangles[i];
	            if (!triangle.boundingSphere)
	                triangle.computeBoundingSphere();
	            if (!sphere$1.intersectsSphere(triangle.boundingSphere))
	                continue;
	            const isIntersected = intersectsSphereTriangle(sphere$1, triangle.a, triangle.b, triangle.c, triangle.normal, intersection);
	            if (!isIntersected)
	                continue;
	            this.contactInfo.push({
	                point: intersection.point.clone(),
	                depth: intersection.depth,
	                triangle,
	            });
	        }
	    }
	    _solvePosition() {
	        // updatePosition() で position を動かした後
	        // 壁と衝突し食い込んでいる場合、
	        // ここで壁の外への押し出しをする
	        // let triangle;
	        let normal;
	        // let distance;
	        if (this.contactInfo.length === 0) {
	            // 何とも衝突していない
	            // position の値をそのままつかって終了
	            this.object.position.copy(this.position);
	            this.object.rotation.y = this.direction + Math.PI;
	            return;
	        }
	        //
	        // vs walls and sliding on the wall
	        translate.set(0, 0, 0);
	        for (let i = 0, l = this.contactInfo.length; i < l; i++) {
	            // triangle = this.contactInfo[ i ].triangle;
	            normal = this.contactInfo[i].triangle.normal;
	            // distance = this.contactInfo[ i ].distance;
	            // if ( 0 <= distance ) {
	            //   // 交差点までの距離が 0 以上ならこのフェイスとは衝突していない
	            //   // 無視する
	            //   continue;
	            // }
	            if (this.maxSlopeGradient < normal.y) {
	                // this triangle is a ground or slope, not a wall or ceil
	                // フェイスは急勾配でない坂、つまり地面。
	                // 接地の処理は updatePosition() 内で解決しているので無視する
	                continue;
	            }
	            // フェイスは急勾配な坂か否か
	            const isSlopeFace = (this.maxSlopeGradient <= normal.y && normal.y < 1);
	            // ジャンプ降下中に、急勾配な坂に衝突したらジャンプ終わり
	            if (this.isJumping && 0 >= this.currentJumpPower && isSlopeFace) {
	                this.isJumping = false;
	                this.isGrounded = true;
	                // console.log( 'jump end' );
	            }
	            // if ( this.isGrounded || this.isOnSlope ) {
	            //   // 地面の上にいる場合はy(縦)方向は同一のまま
	            //   // x, z (横) 方向だけを変更して押し出す
	            //   // http://gamedev.stackexchange.com/questions/80293/how-do-i-resolve-a-sphere-triangle-collision-in-a-given-direction
	            // 	sphereCenter.set( 0, this.radius, 0 ).add( this.position );
	            // 	point1.copy( normal ).multiplyScalar( - this.radius ).add( sphereCenter );
	            // 	direction.set( normal.x, 0, normal.z ).normalize();
	            // 	const plainD = triangle.a.dot( normal );
	            // 	const t = ( plainD - ( normal.x * point1.x + normal.y * point1.y + normal.z * point1.z ) ) / ( normal.x * direction.x + normal.y * direction.y + normal.z * direction.z );
	            // 	point2.copy( direction ).multiplyScalar( t ).add( point1 );
	            // 	translateScoped.subVectors( point2, point1 );
	            // 	if ( translate.lengthSq() < translateScoped.lengthSq() ) {
	            // 		translate.copy( translateScoped );
	            // 	}
	            // 	// break;
	            // 	continue;
	            // }
	        }
	        this.position.add(translate);
	        this.object.position.copy(this.position);
	        this.object.rotation.y = this.direction + Math.PI;
	    }
	    setDirection() { }
	    jump() {
	        if (this.isJumping || !this.isGrounded || this.isOnSlope)
	            return;
	        this.jumpStartTime = performance.now();
	        this.currentJumpPower = 1;
	        this.isJumping = true;
	    }
	    _updateJumping() {
	        if (!this.isJumping)
	            return;
	        const elapsed = performance.now() - this.jumpStartTime;
	        const progress = elapsed / JUMP_DURATION;
	        this.currentJumpPower = Math.cos(Math.min(progress, 1) * Math.PI);
	    }
	    teleport(x, y, z) {
	        this.position.set(x, y, z);
	        this.object.position.copy(this.position);
	    }
	    turn(radian) {
	        this.direction = radian;
	        this.object.rotation.y = this.direction + Math.PI;
	    }
	}

	const sphere = new three.Sphere();
	class World {
	    constructor({ fps = 60, stepsPerFrame = 4 } = {}) {
	        this.colliderPool = [];
	        this.characterPool = [];
	        this._fps = fps;
	        this._stepsPerFrame = stepsPerFrame;
	    }
	    add(object) {
	        if (object instanceof Octree) {
	            this.colliderPool.push(object);
	        }
	        if (object instanceof CharacterController) {
	            this.characterPool.push(object);
	        }
	    }
	    remove(object) {
	        if (object instanceof Octree) {
	            const index = this.colliderPool.indexOf(object);
	            if (index !== -1)
	                this.colliderPool.splice(index, 1);
	        }
	        if (object instanceof CharacterController) {
	            const index = this.characterPool.indexOf(object);
	            if (index !== -1)
	                this.characterPool.splice(index, 1);
	        }
	    }
	    fixedUpdate() {
	        const deltaTime = 1 / this._fps;
	        const stepDeltaTime = deltaTime / this._stepsPerFrame;
	        for (let i = 0; i < this._stepsPerFrame; i++) {
	            this.step(stepDeltaTime);
	        }
	    }
	    step(stepDeltaTime) {
	        for (let i = 0, l = this.characterPool.length; i < l; i++) {
	            const character = this.characterPool[i];
	            let triangles = [];
	            // octree で絞られた node に含まれる face だけを
	            // character に渡して判定する
	            for (let ii = 0, ll = this.colliderPool.length; ii < ll; ii++) {
	                const octree = this.colliderPool[ii];
	                sphere.center.set(0, character.radius, 0).add(character.position);
	                sphere.radius = character.radius + character.groundCheckDepth;
	                triangles.push(...octree.getSphereTriangles(sphere, []));
	            }
	            character.setNearTriangles(triangles);
	            character.update(stepDeltaTime);
	        }
	    }
	}

	const TURN_DURATION = 200;
	const TAU = 2 * Math.PI;
	const modulo = (n, d) => ((n % d) + d) % d;
	const getDeltaTurnAngle = (current, target) => {
	    const a = modulo((current - target), TAU);
	    const b = modulo((target - current), TAU);
	    return a < b ? -a : b;
	};
	class AnimationController {
	    constructor(mesh, animations) {
	        this._targetRotY = null;
	        this.mesh = mesh;
	        this.motion = {};
	        this.mixer = new three.AnimationMixer(mesh);
	        this.currentMotionName = '';
	        for (let i = 0, l = animations.length; i < l; i++) {
	            const anim = animations[i];
	            this.motion[anim.name] = this.mixer.clipAction(anim);
	            this.motion[anim.name].setEffectiveWeight(1);
	        }
	    }
	    play(name) {
	        if (!this.motion[name])
	            return;
	        if (this.currentMotionName === name)
	            return;
	        if (this.motion[this.currentMotionName]) {
	            const from = this.motion[this.currentMotionName].play();
	            const to = this.motion[name].play();
	            from.enabled = true;
	            to.enabled = true;
	            from.crossFadeTo(to, .3, false);
	        }
	        else {
	            this.motion[name].enabled = true;
	            this.motion[name].play();
	        }
	        this.currentMotionName = name;
	    }
	    turn(rad, immediate) {
	        const that = this;
	        const prevRotY = this.mesh.rotation.y;
	        const targetRotY = rad;
	        const deltaY = getDeltaTurnAngle(prevRotY, targetRotY);
	        // const duration   = Math.abs( deltaY ) * 100;
	        const start = Date.now();
	        const end = start + TURN_DURATION;
	        let progress = 0;
	        if (immediate) {
	            this.mesh.rotation.y = targetRotY;
	            return;
	        }
	        if (this._targetRotY === targetRotY)
	            return;
	        this._targetRotY = targetRotY;
	        {
	            let _targetRotY = targetRotY;
	            (function interval() {
	                const now = Date.now();
	                const isAborted = _targetRotY !== that._targetRotY;
	                if (isAborted)
	                    return;
	                if (now >= end) {
	                    that.mesh.rotation.y = _targetRotY;
	                    that._targetRotY = null;
	                    return;
	                }
	                requestAnimationFrame(interval);
	                progress = (now - start) / TURN_DURATION;
	                that.mesh.rotation.y = prevRotY + deltaY * progress;
	            })();
	        }
	    }
	    update(deltaTime) {
	        this.mixer.update(deltaTime);
	    }
	}

	const KEY_W = 87;
	const KEY_UP = 38;
	const KEY_S = 83;
	const KEY_DOWN = 40;
	const KEY_A = 65;
	const KEY_LEFT = 37;
	const KEY_D = 68;
	const KEY_RIGHT = 39;
	const KEY_SPACE = 32;
	const DEG2RAD$1 = Math.PI / 180;
	const DEG_0 = 0 * DEG2RAD$1;
	const DEG_45 = 45 * DEG2RAD$1;
	const DEG_90 = 90 * DEG2RAD$1;
	const DEG_135 = 135 * DEG2RAD$1;
	const DEG_180 = 180 * DEG2RAD$1;
	const DEG_225 = 225 * DEG2RAD$1;
	const DEG_270 = 270 * DEG2RAD$1;
	const DEG_315 = 315 * DEG2RAD$1;
	class KeyInputControl extends EventDispatcher$1 {
	    constructor() {
	        super();
	        this.isDisabled = false;
	        this.isUp = false;
	        this.isDown = false;
	        this.isLeft = false;
	        this.isRight = false;
	        this.isMoveKeyHolding = false;
	        this.frontAngle = 0;
	        this._keydownListener = (event) => {
	            if (this.isDisabled)
	                return;
	            if (isInputEvent(event))
	                return;
	            switch (event.keyCode) {
	                case KEY_W:
	                case KEY_UP:
	                    this.isUp = true;
	                    break;
	                case KEY_S:
	                case KEY_DOWN:
	                    this.isDown = true;
	                    break;
	                case KEY_A:
	                case KEY_LEFT:
	                    this.isLeft = true;
	                    break;
	                case KEY_D:
	                case KEY_RIGHT:
	                    this.isRight = true;
	                    break;
	                case KEY_SPACE:
	                    this.jump();
	                    break;
	                default:
	                    return;
	            }
	            const prevAngle = this.frontAngle;
	            this.updateAngle();
	            if (prevAngle !== this.frontAngle) {
	                this.dispatchEvent({ type: 'movekeychange' });
	            }
	            if ((this.isUp || this.isDown || this.isLeft || this.isRight) &&
	                !this.isMoveKeyHolding) {
	                this.isMoveKeyHolding = true;
	                this.dispatchEvent({ type: 'movekeyon' });
	            }
	        };
	        this._keyupListener = (event) => {
	            if (this.isDisabled)
	                return;
	            switch (event.keyCode) {
	                case KEY_W:
	                case KEY_UP:
	                    this.isUp = false;
	                    break;
	                case KEY_S:
	                case KEY_DOWN:
	                    this.isDown = false;
	                    break;
	                case KEY_A:
	                case KEY_LEFT:
	                    this.isLeft = false;
	                    break;
	                case KEY_D:
	                case KEY_RIGHT:
	                    this.isRight = false;
	                    break;
	                case KEY_SPACE:
	                    break;
	                default:
	                    return;
	            }
	            const prevAngle = this.frontAngle;
	            this.updateAngle();
	            if (prevAngle !== this.frontAngle) {
	                this.dispatchEvent({ type: 'movekeychange' });
	            }
	            if (!this.isUp && !this.isDown && !this.isLeft && !this.isRight &&
	                (event.keyCode === KEY_W ||
	                    event.keyCode === KEY_UP ||
	                    event.keyCode === KEY_S ||
	                    event.keyCode === KEY_DOWN ||
	                    event.keyCode === KEY_A ||
	                    event.keyCode === KEY_LEFT ||
	                    event.keyCode === KEY_D ||
	                    event.keyCode === KEY_RIGHT)) {
	                this.isMoveKeyHolding = false;
	                this.dispatchEvent({ type: 'movekeyoff' });
	            }
	        };
	        this._blurListener = () => {
	            this.isUp = false;
	            this.isDown = false;
	            this.isLeft = false;
	            this.isRight = false;
	            if (this.isMoveKeyHolding) {
	                this.isMoveKeyHolding = false;
	                this.dispatchEvent({ type: 'movekeyoff' });
	            }
	        };
	        function isInputEvent(event) {
	            const target = event.target;
	            if (!(target instanceof HTMLElement))
	                return false;
	            return (target.tagName === 'INPUT' ||
	                target.tagName === 'SELECT' ||
	                target.tagName === 'TEXTAREA' ||
	                target.tagName === 'BUTTON' ||
	                target.isContentEditable);
	        }
	        window.addEventListener('keydown', this._keydownListener);
	        window.addEventListener('keyup', this._keyupListener);
	        window.addEventListener('blur', this._blurListener);
	        window.addEventListener('contextmenu', this._blurListener);
	    }
	    jump() {
	        this.dispatchEvent({ type: 'jumpkeypress' });
	    }
	    updateAngle() {
	        const up = this.isUp;
	        const down = this.isDown;
	        const left = this.isLeft;
	        const right = this.isRight;
	        if (up && !left && !down && !right)
	            this.frontAngle = DEG_0;
	        else if (up && left && !down && !right)
	            this.frontAngle = DEG_45;
	        else if (!up && left && !down && !right)
	            this.frontAngle = DEG_90;
	        else if (!up && left && down && !right)
	            this.frontAngle = DEG_135;
	        else if (!up && !left && down && !right)
	            this.frontAngle = DEG_180;
	        else if (!up && !left && down && right)
	            this.frontAngle = DEG_225;
	        else if (!up && !left && !down && right)
	            this.frontAngle = DEG_270;
	        else if (up && !left && !down && right)
	            this.frontAngle = DEG_315;
	    }
	    dispose() {
	        window.removeEventListener('keydown', this._keydownListener);
	        window.removeEventListener('keyup', this._keyupListener);
	        window.removeEventListener('blur', this._blurListener);
	        this._blurListener();
	    }
	}

	/*!
	 * camera-controls
	 * https://github.com/yomotsu/camera-controls
	 * (c) 2017 @yomotsu
	 * Released under the MIT License.
	 */
	// see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons#value
	const MOUSE_BUTTON = {
	    LEFT: 1,
	    RIGHT: 2,
	    MIDDLE: 4,
	};
	const ACTION = Object.freeze({
	    NONE: 0,
	    ROTATE: 1,
	    TRUCK: 2,
	    OFFSET: 4,
	    DOLLY: 8,
	    ZOOM: 16,
	    TOUCH_ROTATE: 32,
	    TOUCH_TRUCK: 64,
	    TOUCH_OFFSET: 128,
	    TOUCH_DOLLY: 256,
	    TOUCH_ZOOM: 512,
	    TOUCH_DOLLY_TRUCK: 1024,
	    TOUCH_DOLLY_OFFSET: 2048,
	    TOUCH_DOLLY_ROTATE: 4096,
	    TOUCH_ZOOM_TRUCK: 8192,
	    TOUCH_ZOOM_OFFSET: 16384,
	    TOUCH_ZOOM_ROTATE: 32768,
	});
	const DOLLY_DIRECTION = {
	    NONE: 0,
	    IN: 1,
	    OUT: -1,
	};
	function isPerspectiveCamera(camera) {
	    return camera.isPerspectiveCamera;
	}
	function isOrthographicCamera(camera) {
	    return camera.isOrthographicCamera;
	}

	const PI_2 = Math.PI * 2;
	const PI_HALF = Math.PI / 2;

	const EPSILON = 1e-5;
	const DEG2RAD = Math.PI / 180;
	function clamp(value, min, max) {
	    return Math.max(min, Math.min(max, value));
	}
	function approxZero(number, error = EPSILON) {
	    return Math.abs(number) < error;
	}
	function approxEquals(a, b, error = EPSILON) {
	    return approxZero(a - b, error);
	}
	function roundToStep(value, step) {
	    return Math.round(value / step) * step;
	}
	function infinityToMaxNumber(value) {
	    if (isFinite(value))
	        return value;
	    if (value < 0)
	        return -Number.MAX_VALUE;
	    return Number.MAX_VALUE;
	}
	function maxNumberToInfinity(value) {
	    if (Math.abs(value) < Number.MAX_VALUE)
	        return value;
	    return value * Infinity;
	}
	// https://docs.unity3d.com/ScriptReference/Mathf.SmoothDamp.html
	// https://github.com/Unity-Technologies/UnityCsReference/blob/a2bdfe9b3c4cd4476f44bf52f848063bfaf7b6b9/Runtime/Export/Math/Mathf.cs#L308
	function smoothDamp(current, target, currentVelocityRef, smoothTime, maxSpeed = Infinity, deltaTime) {
	    // Based on Game Programming Gems 4 Chapter 1.10
	    smoothTime = Math.max(0.0001, smoothTime);
	    const omega = 2 / smoothTime;
	    const x = omega * deltaTime;
	    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
	    let change = current - target;
	    const originalTo = target;
	    // Clamp maximum speed
	    const maxChange = maxSpeed * smoothTime;
	    change = clamp(change, -maxChange, maxChange);
	    target = current - change;
	    const temp = (currentVelocityRef.value + omega * change) * deltaTime;
	    currentVelocityRef.value = (currentVelocityRef.value - omega * temp) * exp;
	    let output = target + (change + temp) * exp;
	    // Prevent overshooting
	    if (originalTo - current > 0.0 === output > originalTo) {
	        output = originalTo;
	        currentVelocityRef.value = (output - originalTo) / deltaTime;
	    }
	    return output;
	}
	// https://docs.unity3d.com/ScriptReference/Vector3.SmoothDamp.html
	// https://github.com/Unity-Technologies/UnityCsReference/blob/a2bdfe9b3c4cd4476f44bf52f848063bfaf7b6b9/Runtime/Export/Math/Vector3.cs#L97
	function smoothDampVec3(current, target, currentVelocityRef, smoothTime, maxSpeed = Infinity, deltaTime, out) {
	    // Based on Game Programming Gems 4 Chapter 1.10
	    smoothTime = Math.max(0.0001, smoothTime);
	    const omega = 2 / smoothTime;
	    const x = omega * deltaTime;
	    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
	    let targetX = target.x;
	    let targetY = target.y;
	    let targetZ = target.z;
	    let changeX = current.x - targetX;
	    let changeY = current.y - targetY;
	    let changeZ = current.z - targetZ;
	    const originalToX = targetX;
	    const originalToY = targetY;
	    const originalToZ = targetZ;
	    // Clamp maximum speed
	    const maxChange = maxSpeed * smoothTime;
	    const maxChangeSq = maxChange * maxChange;
	    const magnitudeSq = changeX * changeX + changeY * changeY + changeZ * changeZ;
	    if (magnitudeSq > maxChangeSq) {
	        const magnitude = Math.sqrt(magnitudeSq);
	        changeX = changeX / magnitude * maxChange;
	        changeY = changeY / magnitude * maxChange;
	        changeZ = changeZ / magnitude * maxChange;
	    }
	    targetX = current.x - changeX;
	    targetY = current.y - changeY;
	    targetZ = current.z - changeZ;
	    const tempX = (currentVelocityRef.x + omega * changeX) * deltaTime;
	    const tempY = (currentVelocityRef.y + omega * changeY) * deltaTime;
	    const tempZ = (currentVelocityRef.z + omega * changeZ) * deltaTime;
	    currentVelocityRef.x = (currentVelocityRef.x - omega * tempX) * exp;
	    currentVelocityRef.y = (currentVelocityRef.y - omega * tempY) * exp;
	    currentVelocityRef.z = (currentVelocityRef.z - omega * tempZ) * exp;
	    out.x = targetX + (changeX + tempX) * exp;
	    out.y = targetY + (changeY + tempY) * exp;
	    out.z = targetZ + (changeZ + tempZ) * exp;
	    // Prevent overshooting
	    const origMinusCurrentX = originalToX - current.x;
	    const origMinusCurrentY = originalToY - current.y;
	    const origMinusCurrentZ = originalToZ - current.z;
	    const outMinusOrigX = out.x - originalToX;
	    const outMinusOrigY = out.y - originalToY;
	    const outMinusOrigZ = out.z - originalToZ;
	    if (origMinusCurrentX * outMinusOrigX + origMinusCurrentY * outMinusOrigY + origMinusCurrentZ * outMinusOrigZ > 0) {
	        out.x = originalToX;
	        out.y = originalToY;
	        out.z = originalToZ;
	        currentVelocityRef.x = (out.x - originalToX) / deltaTime;
	        currentVelocityRef.y = (out.y - originalToY) / deltaTime;
	        currentVelocityRef.z = (out.z - originalToZ) / deltaTime;
	    }
	    return out;
	}

	function extractClientCoordFromEvent(pointers, out) {
	    out.set(0, 0);
	    pointers.forEach((pointer) => {
	        out.x += pointer.clientX;
	        out.y += pointer.clientY;
	    });
	    out.x /= pointers.length;
	    out.y /= pointers.length;
	}

	function notSupportedInOrthographicCamera(camera, message) {
	    if (isOrthographicCamera(camera)) {
	        console.warn(`${message} is not supported in OrthographicCamera`);
	        return true;
	    }
	    return false;
	}

	class EventDispatcher {
	    constructor() {
	        this._listeners = {};
	    }
	    /**
	     * Adds the specified event listener.
	     * @param type event name
	     * @param listener handler function
	     * @category Methods
	     */
	    addEventListener(type, listener) {
	        const listeners = this._listeners;
	        if (listeners[type] === undefined)
	            listeners[type] = [];
	        if (listeners[type].indexOf(listener) === -1)
	            listeners[type].push(listener);
	    }
	    /**
	     * Presence of the specified event listener.
	     * @param type event name
	     * @param listener handler function
	     * @category Methods
	     */
	    hasEventListener(type, listener) {
	        const listeners = this._listeners;
	        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
	    }
	    /**
	     * Removes the specified event listener
	     * @param type event name
	     * @param listener handler function
	     * @category Methods
	     */
	    removeEventListener(type, listener) {
	        const listeners = this._listeners;
	        const listenerArray = listeners[type];
	        if (listenerArray !== undefined) {
	            const index = listenerArray.indexOf(listener);
	            if (index !== -1)
	                listenerArray.splice(index, 1);
	        }
	    }
	    /**
	     * Removes all event listeners
	     * @param type event name
	     * @category Methods
	     */
	    removeAllEventListeners(type) {
	        if (!type) {
	            this._listeners = {};
	            return;
	        }
	        if (Array.isArray(this._listeners[type]))
	            this._listeners[type].length = 0;
	    }
	    /**
	     * Fire an event type.
	     * @param event DispatcherEvent
	     * @category Methods
	     */
	    dispatchEvent(event) {
	        const listeners = this._listeners;
	        const listenerArray = listeners[event.type];
	        if (listenerArray !== undefined) {
	            event.target = this;
	            const array = listenerArray.slice(0);
	            for (let i = 0, l = array.length; i < l; i++) {
	                array[i].call(this, event);
	            }
	        }
	    }
	}

	var _a;
	const VERSION = '2.9.0'; // will be replaced with `version` in package.json during the build process.
	const TOUCH_DOLLY_FACTOR = 1 / 8;
	const isMac = /Mac/.test((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _a === void 0 ? void 0 : _a.platform);
	let THREE;
	let _ORIGIN$1;
	let _AXIS_Y;
	let _AXIS_Z;
	let _v2;
	let _v3A$1;
	let _v3B$1;
	let _v3C$1;
	let _cameraDirection;
	let _xColumn;
	let _yColumn;
	let _zColumn;
	let _deltaTarget;
	let _deltaOffset;
	let _sphericalA;
	let _sphericalB;
	let _box3A;
	let _box3B;
	let _sphere;
	let _quaternionA;
	let _quaternionB;
	let _rotationMatrix$1;
	let _raycaster;
	class CameraControls extends EventDispatcher {
	    /**
	     * Injects THREE as the dependency. You can then proceed to use CameraControls.
	     *
	     * e.g
	     * ```javascript
	     * CameraControls.install( { THREE: THREE } );
	     * ```
	     *
	     * Note: If you do not wish to use enter three.js to reduce file size(tree-shaking for example), make a subset to install.
	     *
	     * ```js
	     * import {
	     * 	Vector2,
	     * 	Vector3,
	     * 	Vector4,
	     * 	Quaternion,
	     * 	Matrix4,
	     * 	Spherical,
	     * 	Box3,
	     * 	Sphere,
	     * 	Raycaster,
	     * 	MathUtils,
	     * } from 'three';
	     *
	     * const subsetOfTHREE = {
	     * 	Vector2   : Vector2,
	     * 	Vector3   : Vector3,
	     * 	Vector4   : Vector4,
	     * 	Quaternion: Quaternion,
	     * 	Matrix4   : Matrix4,
	     * 	Spherical : Spherical,
	     * 	Box3      : Box3,
	     * 	Sphere    : Sphere,
	     * 	Raycaster : Raycaster,
	     * };

	     * CameraControls.install( { THREE: subsetOfTHREE } );
	     * ```
	     * @category Statics
	     */
	    static install(libs) {
	        THREE = libs.THREE;
	        _ORIGIN$1 = Object.freeze(new THREE.Vector3(0, 0, 0));
	        _AXIS_Y = Object.freeze(new THREE.Vector3(0, 1, 0));
	        _AXIS_Z = Object.freeze(new THREE.Vector3(0, 0, 1));
	        _v2 = new THREE.Vector2();
	        _v3A$1 = new THREE.Vector3();
	        _v3B$1 = new THREE.Vector3();
	        _v3C$1 = new THREE.Vector3();
	        _cameraDirection = new THREE.Vector3();
	        _xColumn = new THREE.Vector3();
	        _yColumn = new THREE.Vector3();
	        _zColumn = new THREE.Vector3();
	        _deltaTarget = new THREE.Vector3();
	        _deltaOffset = new THREE.Vector3();
	        _sphericalA = new THREE.Spherical();
	        _sphericalB = new THREE.Spherical();
	        _box3A = new THREE.Box3();
	        _box3B = new THREE.Box3();
	        _sphere = new THREE.Sphere();
	        _quaternionA = new THREE.Quaternion();
	        _quaternionB = new THREE.Quaternion();
	        _rotationMatrix$1 = new THREE.Matrix4();
	        _raycaster = new THREE.Raycaster();
	    }
	    /**
	     * list all ACTIONs
	     * @category Statics
	     */
	    static get ACTION() {
	        return ACTION;
	    }
	    /**
	     * Creates a `CameraControls` instance.
	     *
	     * Note:
	     * You **must install** three.js before using camera-controls. see [#install](#install)
	     * Not doing so will lead to runtime errors (`undefined` references to THREE).
	     *
	     * e.g.
	     * ```
	     * CameraControls.install( { THREE } );
	     * const cameraControls = new CameraControls( camera, domElement );
	     * ```
	     *
	     * @param camera A `THREE.PerspectiveCamera` or `THREE.OrthographicCamera` to be controlled.
	     * @param domElement A `HTMLElement` for the draggable area, usually `renderer.domElement`.
	     * @category Constructor
	     */
	    constructor(camera, domElement) {
	        super();
	        /**
	         * Minimum vertical angle in radians.
	         * The angle has to be between `0` and `.maxPolarAngle` inclusive.
	         * The default value is `0`.
	         *
	         * e.g.
	         * ```
	         * cameraControls.maxPolarAngle = 0;
	         * ```
	         * @category Properties
	         */
	        this.minPolarAngle = 0; // radians
	        /**
	         * Maximum vertical angle in radians.
	         * The angle has to be between `.maxPolarAngle` and `Math.PI` inclusive.
	         * The default value is `Math.PI`.
	         *
	         * e.g.
	         * ```
	         * cameraControls.maxPolarAngle = Math.PI;
	         * ```
	         * @category Properties
	         */
	        this.maxPolarAngle = Math.PI; // radians
	        /**
	         * Minimum horizontal angle in radians.
	         * The angle has to be less than `.maxAzimuthAngle`.
	         * The default value is `- Infinity`.
	         *
	         * e.g.
	         * ```
	         * cameraControls.minAzimuthAngle = - Infinity;
	         * ```
	         * @category Properties
	         */
	        this.minAzimuthAngle = -Infinity; // radians
	        /**
	         * Maximum horizontal angle in radians.
	         * The angle has to be greater than `.minAzimuthAngle`.
	         * The default value is `Infinity`.
	         *
	         * e.g.
	         * ```
	         * cameraControls.maxAzimuthAngle = Infinity;
	         * ```
	         * @category Properties
	         */
	        this.maxAzimuthAngle = Infinity; // radians
	        // How far you can dolly in and out ( PerspectiveCamera only )
	        /**
	         * Minimum distance for dolly. The value must be higher than `0`. Default is `Number.EPSILON`.
	         * PerspectiveCamera only.
	         * @category Properties
	         */
	        this.minDistance = Number.EPSILON;
	        /**
	         * Maximum distance for dolly. The value must be higher than `minDistance`. Default is `Infinity`.
	         * PerspectiveCamera only.
	         * @category Properties
	         */
	        this.maxDistance = Infinity;
	        /**
	         * `true` to enable Infinity Dolly for wheel and pinch. Use this with `minDistance` and `maxDistance`
	         * If the Dolly distance is less (or over) than the `minDistance` (or `maxDistance`), `infinityDolly` will keep the distance and pushes the target position instead.
	         * @category Properties
	         */
	        this.infinityDolly = false;
	        /**
	         * Minimum camera zoom.
	         * @category Properties
	         */
	        this.minZoom = 0.01;
	        /**
	         * Maximum camera zoom.
	         * @category Properties
	         */
	        this.maxZoom = Infinity;
	        /**
	         * Approximate time in seconds to reach the target. A smaller value will reach the target faster.
	         * @category Properties
	         */
	        this.smoothTime = 0.25;
	        /**
	         * the smoothTime while dragging
	         * @category Properties
	         */
	        this.draggingSmoothTime = 0.125;
	        /**
	         * Max transition speed in unit-per-seconds
	         * @category Properties
	         */
	        this.maxSpeed = Infinity;
	        /**
	         * Speed of azimuth (horizontal) rotation.
	         * @category Properties
	         */
	        this.azimuthRotateSpeed = 1.0;
	        /**
	         * Speed of polar (vertical) rotation.
	         * @category Properties
	         */
	        this.polarRotateSpeed = 1.0;
	        /**
	         * Speed of mouse-wheel dollying.
	         * @category Properties
	         */
	        this.dollySpeed = 1.0;
	        /**
	         * `true` to invert direction when dollying or zooming via drag
	         * @category Properties
	         */
	        this.dollyDragInverted = false;
	        /**
	         * Speed of drag for truck and pedestal.
	         * @category Properties
	         */
	        this.truckSpeed = 2.0;
	        /**
	         * `true` to enable Dolly-in to the mouse cursor coords.
	         * @category Properties
	         */
	        this.dollyToCursor = false;
	        /**
	         * @category Properties
	         */
	        this.dragToOffset = false;
	        /**
	         * The same as `.screenSpacePanning` in three.js's OrbitControls.
	         * @category Properties
	         */
	        this.verticalDragToForward = false;
	        /**
	         * Friction ratio of the boundary.
	         * @category Properties
	         */
	        this.boundaryFriction = 0.0;
	        /**
	         * Controls how soon the `rest` event fires as the camera slows.
	         * @category Properties
	         */
	        this.restThreshold = 0.01;
	        /**
	         * An array of Meshes to collide with camera.
	         * Be aware colliderMeshes may decrease performance. The collision test uses 4 raycasters from the camera since the near plane has 4 corners.
	         * @category Properties
	         */
	        this.colliderMeshes = [];
	        /**
	         * Force cancel user dragging.
	         * @category Methods
	         */
	        // cancel will be overwritten in the constructor.
	        this.cancel = () => { };
	        this._enabled = true;
	        this._state = ACTION.NONE;
	        this._viewport = null;
	        this._changedDolly = 0;
	        this._changedZoom = 0;
	        this._hasRested = true;
	        this._boundaryEnclosesCamera = false;
	        this._needsUpdate = true;
	        this._updatedLastTime = false;
	        this._elementRect = new DOMRect();
	        this._isDragging = false;
	        this._dragNeedsUpdate = true;
	        this._activePointers = [];
	        this._lockedPointer = null;
	        this._interactiveArea = new DOMRect(0, 0, 1, 1);
	        // Use draggingSmoothTime over smoothTime while true.
	        // set automatically true on user-dragging start.
	        // set automatically false on programmable methods call.
	        this._isUserControllingRotate = false;
	        this._isUserControllingDolly = false;
	        this._isUserControllingTruck = false;
	        this._isUserControllingOffset = false;
	        this._isUserControllingZoom = false;
	        this._lastDollyDirection = DOLLY_DIRECTION.NONE;
	        // velocities for smoothDamp
	        this._thetaVelocity = { value: 0 };
	        this._phiVelocity = { value: 0 };
	        this._radiusVelocity = { value: 0 };
	        this._targetVelocity = new THREE.Vector3();
	        this._focalOffsetVelocity = new THREE.Vector3();
	        this._zoomVelocity = { value: 0 };
	        this._truckInternal = (deltaX, deltaY, dragToOffset) => {
	            let truckX;
	            let pedestalY;
	            if (isPerspectiveCamera(this._camera)) {
	                const offset = _v3A$1.copy(this._camera.position).sub(this._target);
	                // half of the fov is center to top of screen
	                const fov = this._camera.getEffectiveFOV() * DEG2RAD;
	                const targetDistance = offset.length() * Math.tan(fov * 0.5);
	                truckX = (this.truckSpeed * deltaX * targetDistance / this._elementRect.height);
	                pedestalY = (this.truckSpeed * deltaY * targetDistance / this._elementRect.height);
	            }
	            else if (isOrthographicCamera(this._camera)) {
	                const camera = this._camera;
	                truckX = deltaX * (camera.right - camera.left) / camera.zoom / this._elementRect.width;
	                pedestalY = deltaY * (camera.top - camera.bottom) / camera.zoom / this._elementRect.height;
	            }
	            else {
	                return;
	            }
	            if (this.verticalDragToForward) {
	                dragToOffset ?
	                    this.setFocalOffset(this._focalOffsetEnd.x + truckX, this._focalOffsetEnd.y, this._focalOffsetEnd.z, true) :
	                    this.truck(truckX, 0, true);
	                this.forward(-pedestalY, true);
	            }
	            else {
	                dragToOffset ?
	                    this.setFocalOffset(this._focalOffsetEnd.x + truckX, this._focalOffsetEnd.y + pedestalY, this._focalOffsetEnd.z, true) :
	                    this.truck(truckX, pedestalY, true);
	            }
	        };
	        this._rotateInternal = (deltaX, deltaY) => {
	            const theta = PI_2 * this.azimuthRotateSpeed * deltaX / this._elementRect.height; // divide by *height* to refer the resolution
	            const phi = PI_2 * this.polarRotateSpeed * deltaY / this._elementRect.height;
	            this.rotate(theta, phi, true);
	        };
	        this._dollyInternal = (delta, x, y) => {
	            const dollyScale = Math.pow(0.95, -delta * this.dollySpeed);
	            const lastDistance = this._sphericalEnd.radius;
	            const distance = this._sphericalEnd.radius * dollyScale;
	            const clampedDistance = clamp(distance, this.minDistance, this.maxDistance);
	            const overflowedDistance = clampedDistance - distance;
	            if (this.infinityDolly && this.dollyToCursor) {
	                this._dollyToNoClamp(distance, true);
	            }
	            else if (this.infinityDolly && !this.dollyToCursor) {
	                this.dollyInFixed(overflowedDistance, true);
	                this._dollyToNoClamp(clampedDistance, true);
	            }
	            else {
	                this._dollyToNoClamp(clampedDistance, true);
	            }
	            if (this.dollyToCursor) {
	                this._changedDolly += (this.infinityDolly ? distance : clampedDistance) - lastDistance;
	                this._dollyControlCoord.set(x, y);
	            }
	            this._lastDollyDirection = Math.sign(-delta);
	        };
	        this._zoomInternal = (delta, x, y) => {
	            const zoomScale = Math.pow(0.95, delta * this.dollySpeed);
	            const lastZoom = this._zoom;
	            const zoom = this._zoom * zoomScale;
	            // for both PerspectiveCamera and OrthographicCamera
	            this.zoomTo(zoom, true);
	            if (this.dollyToCursor) {
	                this._changedZoom += zoom - lastZoom;
	                this._dollyControlCoord.set(x, y);
	            }
	        };
	        // Check if the user has installed THREE
	        if (typeof THREE === 'undefined') {
	            console.error('camera-controls: `THREE` is undefined. You must first run `CameraControls.install( { THREE: THREE } )`. Check the docs for further information.');
	        }
	        this._camera = camera;
	        this._yAxisUpSpace = new THREE.Quaternion().setFromUnitVectors(this._camera.up, _AXIS_Y);
	        this._yAxisUpSpaceInverse = this._yAxisUpSpace.clone().invert();
	        this._state = ACTION.NONE;
	        // the location
	        this._target = new THREE.Vector3();
	        this._targetEnd = this._target.clone();
	        this._focalOffset = new THREE.Vector3();
	        this._focalOffsetEnd = this._focalOffset.clone();
	        // rotation
	        this._spherical = new THREE.Spherical().setFromVector3(_v3A$1.copy(this._camera.position).applyQuaternion(this._yAxisUpSpace));
	        this._sphericalEnd = this._spherical.clone();
	        this._lastDistance = this._spherical.radius;
	        this._zoom = this._camera.zoom;
	        this._zoomEnd = this._zoom;
	        this._lastZoom = this._zoom;
	        // collisionTest uses nearPlane.s
	        this._nearPlaneCorners = [
	            new THREE.Vector3(),
	            new THREE.Vector3(),
	            new THREE.Vector3(),
	            new THREE.Vector3(),
	        ];
	        this._updateNearPlaneCorners();
	        // Target cannot move outside of this box
	        this._boundary = new THREE.Box3(new THREE.Vector3(-Infinity, -Infinity, -Infinity), new THREE.Vector3(Infinity, Infinity, Infinity));
	        // reset
	        this._cameraUp0 = this._camera.up.clone();
	        this._target0 = this._target.clone();
	        this._position0 = this._camera.position.clone();
	        this._zoom0 = this._zoom;
	        this._focalOffset0 = this._focalOffset.clone();
	        this._dollyControlCoord = new THREE.Vector2();
	        // configs
	        this.mouseButtons = {
	            left: ACTION.ROTATE,
	            middle: ACTION.DOLLY,
	            right: ACTION.TRUCK,
	            wheel: isPerspectiveCamera(this._camera) ? ACTION.DOLLY :
	                isOrthographicCamera(this._camera) ? ACTION.ZOOM :
	                    ACTION.NONE,
	        };
	        this.touches = {
	            one: ACTION.TOUCH_ROTATE,
	            two: isPerspectiveCamera(this._camera) ? ACTION.TOUCH_DOLLY_TRUCK :
	                isOrthographicCamera(this._camera) ? ACTION.TOUCH_ZOOM_TRUCK :
	                    ACTION.NONE,
	            three: ACTION.TOUCH_TRUCK,
	        };
	        const dragStartPosition = new THREE.Vector2();
	        const lastDragPosition = new THREE.Vector2();
	        const dollyStart = new THREE.Vector2();
	        const onPointerDown = (event) => {
	            if (!this._enabled || !this._domElement)
	                return;
	            if (this._interactiveArea.left !== 0 ||
	                this._interactiveArea.top !== 0 ||
	                this._interactiveArea.width !== 1 ||
	                this._interactiveArea.height !== 1) {
	                const elRect = this._domElement.getBoundingClientRect();
	                const left = event.clientX / elRect.width;
	                const top = event.clientY / elRect.height;
	                // check if the interactiveArea contains the drag start position.
	                if (left < this._interactiveArea.left ||
	                    left > this._interactiveArea.right ||
	                    top < this._interactiveArea.top ||
	                    top > this._interactiveArea.bottom)
	                    return;
	            }
	            // Don't call `event.preventDefault()` on the pointerdown event
	            // to keep receiving pointermove evens outside dragging iframe
	            // https://taye.me/blog/tips/2015/11/16/mouse-drag-outside-iframe/
	            const mouseButton = event.pointerType !== 'mouse' ? null :
	                (event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT ? MOUSE_BUTTON.LEFT :
	                    (event.buttons & MOUSE_BUTTON.MIDDLE) === MOUSE_BUTTON.MIDDLE ? MOUSE_BUTTON.MIDDLE :
	                        (event.buttons & MOUSE_BUTTON.RIGHT) === MOUSE_BUTTON.RIGHT ? MOUSE_BUTTON.RIGHT :
	                            null;
	            if (mouseButton !== null) {
	                const zombiePointer = this._findPointerByMouseButton(mouseButton);
	                zombiePointer && this._disposePointer(zombiePointer);
	            }
	            if ((event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT && this._lockedPointer)
	                return;
	            const pointer = {
	                pointerId: event.pointerId,
	                clientX: event.clientX,
	                clientY: event.clientY,
	                deltaX: 0,
	                deltaY: 0,
	                mouseButton,
	            };
	            this._activePointers.push(pointer);
	            // eslint-disable-next-line no-undef
	            this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, { passive: false });
	            this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
	            this._domElement.ownerDocument.addEventListener('pointermove', onPointerMove, { passive: false });
	            this._domElement.ownerDocument.addEventListener('pointerup', onPointerUp);
	            this._isDragging = true;
	            startDragging(event);
	        };
	        const onPointerMove = (event) => {
	            if (event.cancelable)
	                event.preventDefault();
	            const pointerId = event.pointerId;
	            const pointer = this._lockedPointer || this._findPointerById(pointerId);
	            if (!pointer)
	                return;
	            pointer.clientX = event.clientX;
	            pointer.clientY = event.clientY;
	            pointer.deltaX = event.movementX;
	            pointer.deltaY = event.movementY;
	            this._state = 0;
	            if (event.pointerType === 'touch') {
	                switch (this._activePointers.length) {
	                    case 1:
	                        this._state = this.touches.one;
	                        break;
	                    case 2:
	                        this._state = this.touches.two;
	                        break;
	                    case 3:
	                        this._state = this.touches.three;
	                        break;
	                }
	            }
	            else {
	                if ((!this._isDragging && this._lockedPointer) ||
	                    this._isDragging && (event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT) {
	                    this._state = this._state | this.mouseButtons.left;
	                }
	                if (this._isDragging && (event.buttons & MOUSE_BUTTON.MIDDLE) === MOUSE_BUTTON.MIDDLE) {
	                    this._state = this._state | this.mouseButtons.middle;
	                }
	                if (this._isDragging && (event.buttons & MOUSE_BUTTON.RIGHT) === MOUSE_BUTTON.RIGHT) {
	                    this._state = this._state | this.mouseButtons.right;
	                }
	            }
	            dragging();
	        };
	        const onPointerUp = (event) => {
	            const pointer = this._findPointerById(event.pointerId);
	            if (pointer && pointer === this._lockedPointer)
	                return;
	            pointer && this._disposePointer(pointer);
	            if (event.pointerType === 'touch') {
	                switch (this._activePointers.length) {
	                    case 0:
	                        this._state = ACTION.NONE;
	                        break;
	                    case 1:
	                        this._state = this.touches.one;
	                        break;
	                    case 2:
	                        this._state = this.touches.two;
	                        break;
	                    case 3:
	                        this._state = this.touches.three;
	                        break;
	                }
	            }
	            else {
	                this._state = ACTION.NONE;
	            }
	            endDragging();
	        };
	        let lastScrollTimeStamp = -1;
	        const onMouseWheel = (event) => {
	            if (!this._domElement)
	                return;
	            if (!this._enabled || this.mouseButtons.wheel === ACTION.NONE)
	                return;
	            if (this._interactiveArea.left !== 0 ||
	                this._interactiveArea.top !== 0 ||
	                this._interactiveArea.width !== 1 ||
	                this._interactiveArea.height !== 1) {
	                const elRect = this._domElement.getBoundingClientRect();
	                const left = event.clientX / elRect.width;
	                const top = event.clientY / elRect.height;
	                // check if the interactiveArea contains the drag start position.
	                if (left < this._interactiveArea.left ||
	                    left > this._interactiveArea.right ||
	                    top < this._interactiveArea.top ||
	                    top > this._interactiveArea.bottom)
	                    return;
	            }
	            event.preventDefault();
	            if (this.dollyToCursor ||
	                this.mouseButtons.wheel === ACTION.ROTATE ||
	                this.mouseButtons.wheel === ACTION.TRUCK) {
	                const now = performance.now();
	                // only need to fire this at scroll start.
	                if (lastScrollTimeStamp - now < 1000)
	                    this._getClientRect(this._elementRect);
	                lastScrollTimeStamp = now;
	            }
	            // Ref: https://github.com/cedricpinson/osgjs/blob/00e5a7e9d9206c06fdde0436e1d62ab7cb5ce853/sources/osgViewer/input/source/InputSourceMouse.js#L89-L103
	            const deltaYFactor = isMac ? -1 : -3;
	            const delta = (event.deltaMode === 1) ? event.deltaY / deltaYFactor : event.deltaY / (deltaYFactor * 10);
	            const x = this.dollyToCursor ? (event.clientX - this._elementRect.x) / this._elementRect.width * 2 - 1 : 0;
	            const y = this.dollyToCursor ? (event.clientY - this._elementRect.y) / this._elementRect.height * -2 + 1 : 0;
	            switch (this.mouseButtons.wheel) {
	                case ACTION.ROTATE: {
	                    this._rotateInternal(event.deltaX, event.deltaY);
	                    this._isUserControllingRotate = true;
	                    break;
	                }
	                case ACTION.TRUCK: {
	                    this._truckInternal(event.deltaX, event.deltaY, false);
	                    this._isUserControllingTruck = true;
	                    break;
	                }
	                case ACTION.OFFSET: {
	                    this._truckInternal(event.deltaX, event.deltaY, true);
	                    this._isUserControllingOffset = true;
	                    break;
	                }
	                case ACTION.DOLLY: {
	                    this._dollyInternal(-delta, x, y);
	                    this._isUserControllingDolly = true;
	                    break;
	                }
	                case ACTION.ZOOM: {
	                    this._zoomInternal(-delta, x, y);
	                    this._isUserControllingZoom = true;
	                    break;
	                }
	            }
	            this.dispatchEvent({ type: 'control' });
	        };
	        const onContextMenu = (event) => {
	            if (!this._domElement || !this._enabled)
	                return;
	            // contextmenu event is fired right after pointerdown
	            // remove attached handlers and active pointer, if interrupted by contextmenu.
	            if (this.mouseButtons.right === CameraControls.ACTION.NONE) {
	                const pointerId = event instanceof PointerEvent ? event.pointerId : 0;
	                const pointer = this._findPointerById(pointerId);
	                pointer && this._disposePointer(pointer);
	                // eslint-disable-next-line no-undef
	                this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, { passive: false });
	                this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
	                return;
	            }
	            event.preventDefault();
	        };
	        const startDragging = (event) => {
	            if (!this._enabled)
	                return;
	            extractClientCoordFromEvent(this._activePointers, _v2);
	            this._getClientRect(this._elementRect);
	            dragStartPosition.copy(_v2);
	            lastDragPosition.copy(_v2);
	            const isMultiTouch = this._activePointers.length >= 2;
	            if (isMultiTouch) {
	                // 2 finger pinch
	                const dx = _v2.x - this._activePointers[1].clientX;
	                const dy = _v2.y - this._activePointers[1].clientY;
	                const distance = Math.sqrt(dx * dx + dy * dy);
	                dollyStart.set(0, distance);
	                // center coords of 2 finger truck
	                const x = (this._activePointers[0].clientX + this._activePointers[1].clientX) * 0.5;
	                const y = (this._activePointers[0].clientY + this._activePointers[1].clientY) * 0.5;
	                lastDragPosition.set(x, y);
	            }
	            this._state = 0;
	            if (!event) {
	                if (this._lockedPointer)
	                    this._state = this._state | this.mouseButtons.left;
	            }
	            else if ('pointerType' in event && event.pointerType === 'touch') {
	                switch (this._activePointers.length) {
	                    case 1:
	                        this._state = this.touches.one;
	                        break;
	                    case 2:
	                        this._state = this.touches.two;
	                        break;
	                    case 3:
	                        this._state = this.touches.three;
	                        break;
	                }
	            }
	            else {
	                if (!this._lockedPointer && (event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT) {
	                    this._state = this._state | this.mouseButtons.left;
	                }
	                if ((event.buttons & MOUSE_BUTTON.MIDDLE) === MOUSE_BUTTON.MIDDLE) {
	                    this._state = this._state | this.mouseButtons.middle;
	                }
	                if ((event.buttons & MOUSE_BUTTON.RIGHT) === MOUSE_BUTTON.RIGHT) {
	                    this._state = this._state | this.mouseButtons.right;
	                }
	            }
	            // stop current movement on drag start
	            if ((this._state & ACTION.ROTATE) === ACTION.ROTATE ||
	                (this._state & ACTION.TOUCH_ROTATE) === ACTION.TOUCH_ROTATE ||
	                (this._state & ACTION.TOUCH_DOLLY_ROTATE) === ACTION.TOUCH_DOLLY_ROTATE ||
	                (this._state & ACTION.TOUCH_ZOOM_ROTATE) === ACTION.TOUCH_ZOOM_ROTATE) {
	                this._sphericalEnd.theta = this._spherical.theta;
	                this._sphericalEnd.phi = this._spherical.phi;
	                this._thetaVelocity.value = 0;
	                this._phiVelocity.value = 0;
	            }
	            if ((this._state & ACTION.TRUCK) === ACTION.TRUCK ||
	                (this._state & ACTION.TOUCH_TRUCK) === ACTION.TOUCH_TRUCK ||
	                (this._state & ACTION.TOUCH_DOLLY_TRUCK) === ACTION.TOUCH_DOLLY_TRUCK ||
	                (this._state & ACTION.TOUCH_ZOOM_TRUCK) === ACTION.TOUCH_ZOOM_TRUCK) {
	                this._targetEnd.copy(this._target);
	                this._targetVelocity.set(0, 0, 0);
	            }
	            if ((this._state & ACTION.DOLLY) === ACTION.DOLLY ||
	                (this._state & ACTION.TOUCH_DOLLY) === ACTION.TOUCH_DOLLY ||
	                (this._state & ACTION.TOUCH_DOLLY_TRUCK) === ACTION.TOUCH_DOLLY_TRUCK ||
	                (this._state & ACTION.TOUCH_DOLLY_OFFSET) === ACTION.TOUCH_DOLLY_OFFSET ||
	                (this._state & ACTION.TOUCH_DOLLY_ROTATE) === ACTION.TOUCH_DOLLY_ROTATE) {
	                this._sphericalEnd.radius = this._spherical.radius;
	                this._radiusVelocity.value = 0;
	            }
	            if ((this._state & ACTION.ZOOM) === ACTION.ZOOM ||
	                (this._state & ACTION.TOUCH_ZOOM) === ACTION.TOUCH_ZOOM ||
	                (this._state & ACTION.TOUCH_ZOOM_TRUCK) === ACTION.TOUCH_ZOOM_TRUCK ||
	                (this._state & ACTION.TOUCH_ZOOM_OFFSET) === ACTION.TOUCH_ZOOM_OFFSET ||
	                (this._state & ACTION.TOUCH_ZOOM_ROTATE) === ACTION.TOUCH_ZOOM_ROTATE) {
	                this._zoomEnd = this._zoom;
	                this._zoomVelocity.value = 0;
	            }
	            if ((this._state & ACTION.OFFSET) === ACTION.OFFSET ||
	                (this._state & ACTION.TOUCH_OFFSET) === ACTION.TOUCH_OFFSET ||
	                (this._state & ACTION.TOUCH_DOLLY_OFFSET) === ACTION.TOUCH_DOLLY_OFFSET ||
	                (this._state & ACTION.TOUCH_ZOOM_OFFSET) === ACTION.TOUCH_ZOOM_OFFSET) {
	                this._focalOffsetEnd.copy(this._focalOffset);
	                this._focalOffsetVelocity.set(0, 0, 0);
	            }
	            this.dispatchEvent({ type: 'controlstart' });
	        };
	        const dragging = () => {
	            if (!this._enabled || !this._dragNeedsUpdate)
	                return;
	            this._dragNeedsUpdate = false;
	            extractClientCoordFromEvent(this._activePointers, _v2);
	            // When pointer lock is enabled clientX, clientY, screenX, and screenY remain 0.
	            // If pointer lock is enabled, use the Delta directory, and assume active-pointer is not multiple.
	            const isPointerLockActive = this._domElement && this._domElement.ownerDocument.pointerLockElement === this._domElement;
	            const lockedPointer = isPointerLockActive ? this._lockedPointer || this._activePointers[0] : null;
	            const deltaX = lockedPointer ? -lockedPointer.deltaX : lastDragPosition.x - _v2.x;
	            const deltaY = lockedPointer ? -lockedPointer.deltaY : lastDragPosition.y - _v2.y;
	            lastDragPosition.copy(_v2);
	            if ((this._state & ACTION.ROTATE) === ACTION.ROTATE ||
	                (this._state & ACTION.TOUCH_ROTATE) === ACTION.TOUCH_ROTATE ||
	                (this._state & ACTION.TOUCH_DOLLY_ROTATE) === ACTION.TOUCH_DOLLY_ROTATE ||
	                (this._state & ACTION.TOUCH_ZOOM_ROTATE) === ACTION.TOUCH_ZOOM_ROTATE) {
	                this._rotateInternal(deltaX, deltaY);
	                this._isUserControllingRotate = true;
	            }
	            if ((this._state & ACTION.DOLLY) === ACTION.DOLLY ||
	                (this._state & ACTION.ZOOM) === ACTION.ZOOM) {
	                const dollyX = this.dollyToCursor ? (dragStartPosition.x - this._elementRect.x) / this._elementRect.width * 2 - 1 : 0;
	                const dollyY = this.dollyToCursor ? (dragStartPosition.y - this._elementRect.y) / this._elementRect.height * -2 + 1 : 0;
	                const dollyDirection = this.dollyDragInverted ? -1 : 1;
	                if ((this._state & ACTION.DOLLY) === ACTION.DOLLY) {
	                    this._dollyInternal(dollyDirection * deltaY * TOUCH_DOLLY_FACTOR, dollyX, dollyY);
	                    this._isUserControllingDolly = true;
	                }
	                else {
	                    this._zoomInternal(dollyDirection * deltaY * TOUCH_DOLLY_FACTOR, dollyX, dollyY);
	                    this._isUserControllingZoom = true;
	                }
	            }
	            if ((this._state & ACTION.TOUCH_DOLLY) === ACTION.TOUCH_DOLLY ||
	                (this._state & ACTION.TOUCH_ZOOM) === ACTION.TOUCH_ZOOM ||
	                (this._state & ACTION.TOUCH_DOLLY_TRUCK) === ACTION.TOUCH_DOLLY_TRUCK ||
	                (this._state & ACTION.TOUCH_ZOOM_TRUCK) === ACTION.TOUCH_ZOOM_TRUCK ||
	                (this._state & ACTION.TOUCH_DOLLY_OFFSET) === ACTION.TOUCH_DOLLY_OFFSET ||
	                (this._state & ACTION.TOUCH_ZOOM_OFFSET) === ACTION.TOUCH_ZOOM_OFFSET ||
	                (this._state & ACTION.TOUCH_DOLLY_ROTATE) === ACTION.TOUCH_DOLLY_ROTATE ||
	                (this._state & ACTION.TOUCH_ZOOM_ROTATE) === ACTION.TOUCH_ZOOM_ROTATE) {
	                const dx = _v2.x - this._activePointers[1].clientX;
	                const dy = _v2.y - this._activePointers[1].clientY;
	                const distance = Math.sqrt(dx * dx + dy * dy);
	                const dollyDelta = dollyStart.y - distance;
	                dollyStart.set(0, distance);
	                const dollyX = this.dollyToCursor ? (lastDragPosition.x - this._elementRect.x) / this._elementRect.width * 2 - 1 : 0;
	                const dollyY = this.dollyToCursor ? (lastDragPosition.y - this._elementRect.y) / this._elementRect.height * -2 + 1 : 0;
	                if ((this._state & ACTION.TOUCH_DOLLY) === ACTION.TOUCH_DOLLY ||
	                    (this._state & ACTION.TOUCH_DOLLY_ROTATE) === ACTION.TOUCH_DOLLY_ROTATE ||
	                    (this._state & ACTION.TOUCH_DOLLY_TRUCK) === ACTION.TOUCH_DOLLY_TRUCK ||
	                    (this._state & ACTION.TOUCH_DOLLY_OFFSET) === ACTION.TOUCH_DOLLY_OFFSET) {
	                    this._dollyInternal(dollyDelta * TOUCH_DOLLY_FACTOR, dollyX, dollyY);
	                    this._isUserControllingDolly = true;
	                }
	                else {
	                    this._zoomInternal(dollyDelta * TOUCH_DOLLY_FACTOR, dollyX, dollyY);
	                    this._isUserControllingZoom = true;
	                }
	            }
	            if ((this._state & ACTION.TRUCK) === ACTION.TRUCK ||
	                (this._state & ACTION.TOUCH_TRUCK) === ACTION.TOUCH_TRUCK ||
	                (this._state & ACTION.TOUCH_DOLLY_TRUCK) === ACTION.TOUCH_DOLLY_TRUCK ||
	                (this._state & ACTION.TOUCH_ZOOM_TRUCK) === ACTION.TOUCH_ZOOM_TRUCK) {
	                this._truckInternal(deltaX, deltaY, false);
	                this._isUserControllingTruck = true;
	            }
	            if ((this._state & ACTION.OFFSET) === ACTION.OFFSET ||
	                (this._state & ACTION.TOUCH_OFFSET) === ACTION.TOUCH_OFFSET ||
	                (this._state & ACTION.TOUCH_DOLLY_OFFSET) === ACTION.TOUCH_DOLLY_OFFSET ||
	                (this._state & ACTION.TOUCH_ZOOM_OFFSET) === ACTION.TOUCH_ZOOM_OFFSET) {
	                this._truckInternal(deltaX, deltaY, true);
	                this._isUserControllingOffset = true;
	            }
	            this.dispatchEvent({ type: 'control' });
	        };
	        const endDragging = () => {
	            extractClientCoordFromEvent(this._activePointers, _v2);
	            lastDragPosition.copy(_v2);
	            this._dragNeedsUpdate = false;
	            if (this._activePointers.length === 0 ||
	                (this._activePointers.length === 1 && this._activePointers[0] === this._lockedPointer)) {
	                this._isDragging = false;
	            }
	            if (this._activePointers.length === 0 && this._domElement) {
	                // eslint-disable-next-line no-undef
	                this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, { passive: false });
	                this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
	                this.dispatchEvent({ type: 'controlend' });
	            }
	        };
	        this.lockPointer = () => {
	            if (!this._enabled || !this._domElement)
	                return;
	            this.cancel();
	            // Element.requestPointerLock is allowed to happen without any pointer active - create a faux one for compatibility with controls
	            this._lockedPointer = {
	                pointerId: -1,
	                clientX: 0,
	                clientY: 0,
	                deltaX: 0,
	                deltaY: 0,
	                mouseButton: null,
	            };
	            this._activePointers.push(this._lockedPointer);
	            // eslint-disable-next-line no-undef
	            this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, { passive: false });
	            this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
	            this._domElement.requestPointerLock();
	            this._domElement.ownerDocument.addEventListener('pointerlockchange', onPointerLockChange);
	            this._domElement.ownerDocument.addEventListener('pointerlockerror', onPointerLockError);
	            this._domElement.ownerDocument.addEventListener('pointermove', onPointerMove, { passive: false });
	            this._domElement.ownerDocument.addEventListener('pointerup', onPointerUp);
	            startDragging();
	        };
	        this.unlockPointer = () => {
	            var _a, _b, _c;
	            if (this._lockedPointer !== null) {
	                this._disposePointer(this._lockedPointer);
	                this._lockedPointer = null;
	            }
	            (_a = this._domElement) === null || _a === void 0 ? void 0 : _a.ownerDocument.exitPointerLock();
	            (_b = this._domElement) === null || _b === void 0 ? void 0 : _b.ownerDocument.removeEventListener('pointerlockchange', onPointerLockChange);
	            (_c = this._domElement) === null || _c === void 0 ? void 0 : _c.ownerDocument.removeEventListener('pointerlockerror', onPointerLockError);
	            this.cancel();
	        };
	        const onPointerLockChange = () => {
	            const isPointerLockActive = this._domElement && this._domElement.ownerDocument.pointerLockElement === this._domElement;
	            if (!isPointerLockActive)
	                this.unlockPointer();
	        };
	        const onPointerLockError = () => {
	            this.unlockPointer();
	        };
	        this._addAllEventListeners = (domElement) => {
	            this._domElement = domElement;
	            this._domElement.style.touchAction = 'none';
	            this._domElement.style.userSelect = 'none';
	            this._domElement.style.webkitUserSelect = 'none';
	            this._domElement.addEventListener('pointerdown', onPointerDown);
	            this._domElement.addEventListener('pointercancel', onPointerUp);
	            this._domElement.addEventListener('wheel', onMouseWheel, { passive: false });
	            this._domElement.addEventListener('contextmenu', onContextMenu);
	        };
	        this._removeAllEventListeners = () => {
	            if (!this._domElement)
	                return;
	            this._domElement.style.touchAction = '';
	            this._domElement.style.userSelect = '';
	            this._domElement.style.webkitUserSelect = '';
	            this._domElement.removeEventListener('pointerdown', onPointerDown);
	            this._domElement.removeEventListener('pointercancel', onPointerUp);
	            // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#matching_event_listeners_for_removal
	            // > it's probably wise to use the same values used for the call to `addEventListener()` when calling `removeEventListener()`
	            // see https://github.com/microsoft/TypeScript/issues/32912#issuecomment-522142969
	            // eslint-disable-next-line no-undef
	            this._domElement.removeEventListener('wheel', onMouseWheel, { passive: false });
	            this._domElement.removeEventListener('contextmenu', onContextMenu);
	            // eslint-disable-next-line no-undef
	            this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, { passive: false });
	            this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
	            this._domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerLockChange);
	            this._domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerLockError);
	        };
	        this.cancel = () => {
	            if (this._state === ACTION.NONE)
	                return;
	            this._state = ACTION.NONE;
	            this._activePointers.length = 0;
	            endDragging();
	        };
	        if (domElement)
	            this.connect(domElement);
	        this.update(0);
	    }
	    /**
	     * The camera to be controlled
	     * @category Properties
	     */
	    get camera() {
	        return this._camera;
	    }
	    set camera(camera) {
	        this._camera = camera;
	        this.updateCameraUp();
	        this._camera.updateProjectionMatrix();
	        this._updateNearPlaneCorners();
	        this._needsUpdate = true;
	    }
	    /**
	     * Whether or not the controls are enabled.
	     * `false` to disable user dragging/touch-move, but all methods works.
	     * @category Properties
	     */
	    get enabled() {
	        return this._enabled;
	    }
	    set enabled(enabled) {
	        this._enabled = enabled;
	        if (!this._domElement)
	            return;
	        if (enabled) {
	            this._domElement.style.touchAction = 'none';
	            this._domElement.style.userSelect = 'none';
	            this._domElement.style.webkitUserSelect = 'none';
	        }
	        else {
	            this.cancel();
	            this._domElement.style.touchAction = '';
	            this._domElement.style.userSelect = '';
	            this._domElement.style.webkitUserSelect = '';
	        }
	    }
	    /**
	     * Returns `true` if the controls are active updating.
	     * readonly value.
	     * @category Properties
	     */
	    get active() {
	        return !this._hasRested;
	    }
	    /**
	     * Getter for the current `ACTION`.
	     * readonly value.
	     * @category Properties
	     */
	    get currentAction() {
	        return this._state;
	    }
	    /**
	     * get/set Current distance.
	     * @category Properties
	     */
	    get distance() {
	        return this._spherical.radius;
	    }
	    set distance(distance) {
	        if (this._spherical.radius === distance &&
	            this._sphericalEnd.radius === distance)
	            return;
	        this._spherical.radius = distance;
	        this._sphericalEnd.radius = distance;
	        this._needsUpdate = true;
	    }
	    // horizontal angle
	    /**
	     * get/set the azimuth angle (horizontal) in radians.
	     * Every 360 degrees turn is added to `.azimuthAngle` value, which is accumulative.
	     * @category Properties
	     */
	    get azimuthAngle() {
	        return this._spherical.theta;
	    }
	    set azimuthAngle(azimuthAngle) {
	        if (this._spherical.theta === azimuthAngle &&
	            this._sphericalEnd.theta === azimuthAngle)
	            return;
	        this._spherical.theta = azimuthAngle;
	        this._sphericalEnd.theta = azimuthAngle;
	        this._needsUpdate = true;
	    }
	    // vertical angle
	    /**
	     * get/set the polar angle (vertical) in radians.
	     * @category Properties
	     */
	    get polarAngle() {
	        return this._spherical.phi;
	    }
	    set polarAngle(polarAngle) {
	        if (this._spherical.phi === polarAngle &&
	            this._sphericalEnd.phi === polarAngle)
	            return;
	        this._spherical.phi = polarAngle;
	        this._sphericalEnd.phi = polarAngle;
	        this._needsUpdate = true;
	    }
	    /**
	     * Whether camera position should be enclosed in the boundary or not.
	     * @category Properties
	     */
	    get boundaryEnclosesCamera() {
	        return this._boundaryEnclosesCamera;
	    }
	    set boundaryEnclosesCamera(boundaryEnclosesCamera) {
	        this._boundaryEnclosesCamera = boundaryEnclosesCamera;
	        this._needsUpdate = true;
	    }
	    /**
	     * Set drag-start, touches and wheel enable area in the domElement.
	     * each values are between `0` and `1` inclusive, where `0` is left/top and `1` is right/bottom of the screen.
	     * e.g. `{ x: 0, y: 0, width: 1, height: 1 }` for entire area.
	     * @category Properties
	     */
	    set interactiveArea(interactiveArea) {
	        this._interactiveArea.width = clamp(interactiveArea.width, 0, 1);
	        this._interactiveArea.height = clamp(interactiveArea.height, 0, 1);
	        this._interactiveArea.x = clamp(interactiveArea.x, 0, 1 - this._interactiveArea.width);
	        this._interactiveArea.y = clamp(interactiveArea.y, 0, 1 - this._interactiveArea.height);
	    }
	    /**
	     * Adds the specified event listener.
	     * Applicable event types (which is `K`) are:
	     * | Event name          | Timing |
	     * | ------------------- | ------ |
	     * | `'controlstart'`    | When the user starts to control the camera via mouse / touches. ¹ |
	     * | `'control'`         | When the user controls the camera (dragging). |
	     * | `'controlend'`      | When the user ends to control the camera. ¹ |
	     * | `'transitionstart'` | When any kind of transition starts, either user control or using a method with `enableTransition = true` |
	     * | `'update'`          | When the camera position is updated. |
	     * | `'wake'`            | When the camera starts moving. |
	     * | `'rest'`            | When the camera movement is below `.restThreshold` ². |
	     * | `'sleep'`           | When the camera end moving. |
	     *
	     * 1. `mouseButtons.wheel` (Mouse wheel control) does not emit `'controlstart'` and `'controlend'`. `mouseButtons.wheel` uses scroll-event internally, and scroll-event happens intermittently. That means "start" and "end" cannot be detected.
	     * 2. Due to damping, `sleep` will usually fire a few seconds after the camera _appears_ to have stopped moving. If you want to do something (e.g. enable UI, perform another transition) at the point when the camera has stopped, you probably want the `rest` event. This can be fine tuned using the `.restThreshold` parameter. See the [Rest and Sleep Example](https://yomotsu.github.io/camera-controls/examples/rest-and-sleep.html).
	     *
	     * e.g.
	     * ```
	     * cameraControl.addEventListener( 'controlstart', myCallbackFunction );
	     * ```
	     * @param type event name
	     * @param listener handler function
	     * @category Methods
	     */
	    addEventListener(type, listener) {
	        super.addEventListener(type, listener);
	    }
	    /**
	     * Removes the specified event listener
	     * e.g.
	     * ```
	     * cameraControl.addEventListener( 'controlstart', myCallbackFunction );
	     * ```
	     * @param type event name
	     * @param listener handler function
	     * @category Methods
	     */
	    removeEventListener(type, listener) {
	        super.removeEventListener(type, listener);
	    }
	    /**
	     * Rotate azimuthal angle(horizontal) and polar angle(vertical).
	     * Every value is added to the current value.
	     * @param azimuthAngle Azimuth rotate angle. In radian.
	     * @param polarAngle Polar rotate angle. In radian.
	     * @param enableTransition Whether to move smoothly or immediately
	     * @category Methods
	     */
	    rotate(azimuthAngle, polarAngle, enableTransition = false) {
	        return this.rotateTo(this._sphericalEnd.theta + azimuthAngle, this._sphericalEnd.phi + polarAngle, enableTransition);
	    }
	    /**
	     * Rotate azimuthal angle(horizontal) to the given angle and keep the same polar angle(vertical) target.
	     *
	     * e.g.
	     * ```
	     * cameraControls.rotateAzimuthTo( 30 * THREE.MathUtils.DEG2RAD, true );
	     * ```
	     * @param azimuthAngle Azimuth rotate angle. In radian.
	     * @param enableTransition Whether to move smoothly or immediately
	     * @category Methods
	     */
	    rotateAzimuthTo(azimuthAngle, enableTransition = false) {
	        return this.rotateTo(azimuthAngle, this._sphericalEnd.phi, enableTransition);
	    }
	    /**
	     * Rotate polar angle(vertical) to the given angle and keep the same azimuthal angle(horizontal) target.
	     *
	     * e.g.
	     * ```
	     * cameraControls.rotatePolarTo( 30 * THREE.MathUtils.DEG2RAD, true );
	     * ```
	     * @param polarAngle Polar rotate angle. In radian.
	     * @param enableTransition Whether to move smoothly or immediately
	     * @category Methods
	     */
	    rotatePolarTo(polarAngle, enableTransition = false) {
	        return this.rotateTo(this._sphericalEnd.theta, polarAngle, enableTransition);
	    }
	    /**
	     * Rotate azimuthal angle(horizontal) and polar angle(vertical) to the given angle.
	     * Camera view will rotate over the orbit pivot absolutely:
	     *
	     * azimuthAngle
	     * ```
	     *       0º
	     *         \
	     * 90º -----+----- -90º
	     *           \
	     *           180º
	     * ```
	     * | direction | angle                  |
	     * | --------- | ---------------------- |
	     * | front     | 0º                     |
	     * | left      | 90º (`Math.PI / 2`)    |
	     * | right     | -90º (`- Math.PI / 2`) |
	     * | back      | 180º (`Math.PI`)       |
	     *
	     * polarAngle
	     * ```
	     *     180º
	     *      |
	     *      90º
	     *      |
	     *      0º
	     * ```
	     * | direction            | angle                  |
	     * | -------------------- | ---------------------- |
	     * | top/sky              | 180º (`Math.PI`)       |
	     * | horizontal from view | 90º (`Math.PI / 2`)    |
	     * | bottom/floor         | 0º                     |
	     *
	     * @param azimuthAngle Azimuth rotate angle to. In radian.
	     * @param polarAngle Polar rotate angle to. In radian.
	     * @param enableTransition  Whether to move smoothly or immediately
	     * @category Methods
	     */
	    rotateTo(azimuthAngle, polarAngle, enableTransition = false) {
	        this._isUserControllingRotate = false;
	        const theta = clamp(azimuthAngle, this.minAzimuthAngle, this.maxAzimuthAngle);
	        const phi = clamp(polarAngle, this.minPolarAngle, this.maxPolarAngle);
	        this._sphericalEnd.theta = theta;
	        this._sphericalEnd.phi = phi;
	        this._sphericalEnd.makeSafe();
	        this._needsUpdate = true;
	        if (!enableTransition) {
	            this._spherical.theta = this._sphericalEnd.theta;
	            this._spherical.phi = this._sphericalEnd.phi;
	        }
	        const resolveImmediately = !enableTransition ||
	            approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) &&
	                approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold);
	        return this._createOnRestPromise(resolveImmediately);
	    }
	    /**
	     * Dolly in/out camera position.
	     * @param distance Distance of dollyIn. Negative number for dollyOut.
	     * @param enableTransition Whether to move smoothly or immediately.
	     * @category Methods
	     */
	    dolly(distance, enableTransition = false) {
	        return this.dollyTo(this._sphericalEnd.radius - distance, enableTransition);
	    }
	    /**
	     * Dolly in/out camera position to given distance.
	     * @param distance Distance of dolly.
	     * @param enableTransition Whether to move smoothly or immediately.
	     * @category Methods
	     */
	    dollyTo(distance, enableTransition = false) {
	        this._isUserControllingDolly = false;
	        this._lastDollyDirection = DOLLY_DIRECTION.NONE;
	        this._changedDolly = 0;
	        return this._dollyToNoClamp(clamp(distance, this.minDistance, this.maxDistance), enableTransition);
	    }
	    _dollyToNoClamp(distance, enableTransition = false) {
	        const lastRadius = this._sphericalEnd.radius;
	        const hasCollider = this.colliderMeshes.length >= 1;
	        if (hasCollider) {
	            const maxDistanceByCollisionTest = this._collisionTest();
	            const isCollided = approxEquals(maxDistanceByCollisionTest, this._spherical.radius);
	            const isDollyIn = lastRadius > distance;
	            if (!isDollyIn && isCollided)
	                return Promise.resolve();
	            this._sphericalEnd.radius = Math.min(distance, maxDistanceByCollisionTest);
	        }
	        else {
	            this._sphericalEnd.radius = distance;
	        }
	        this._needsUpdate = true;
	        if (!enableTransition) {
	            this._spherical.radius = this._sphericalEnd.radius;
	        }
	        const resolveImmediately = !enableTransition || approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
	        return this._createOnRestPromise(resolveImmediately);
	    }
	    /**
	     * Dolly in, but does not change the distance between the target and the camera, and moves the target position instead.
	     * Specify a negative value for dolly out.
	     * @param distance Distance of dolly.
	     * @param enableTransition Whether to move smoothly or immediately.
	     * @category Methods
	     */
	    dollyInFixed(distance, enableTransition = false) {
	        this._targetEnd.add(this._getCameraDirection(_cameraDirection).multiplyScalar(distance));
	        if (!enableTransition) {
	            this._target.copy(this._targetEnd);
	        }
	        const resolveImmediately = !enableTransition ||
	            approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) &&
	                approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) &&
	                approxEquals(this._target.z, this._targetEnd.z, this.restThreshold);
	        return this._createOnRestPromise(resolveImmediately);
	    }
	    /**
	     * Zoom in/out camera. The value is added to camera zoom.
	     * Limits set with `.minZoom` and `.maxZoom`
	     * @param zoomStep zoom scale
	     * @param enableTransition Whether to move smoothly or immediately
	     * @category Methods
	     */
	    zoom(zoomStep, enableTransition = false) {
	        return this.zoomTo(this._zoomEnd + zoomStep, enableTransition);
	    }
	    /**
	     * Zoom in/out camera to given scale. The value overwrites camera zoom.
	     * Limits set with .minZoom and .maxZoom
	     * @param zoom
	     * @param enableTransition
	     * @category Methods
	     */
	    zoomTo(zoom, enableTransition = false) {
	        this._isUserControllingZoom = false;
	        this._zoomEnd = clamp(zoom, this.minZoom, this.maxZoom);
	        this._needsUpdate = true;
	        if (!enableTransition) {
	            this._zoom = this._zoomEnd;
	        }
	        const resolveImmediately = !enableTransition || approxEquals(this._zoom, this._zoomEnd, this.restThreshold);
	        this._changedZoom = 0;
	        return this._createOnRestPromise(resolveImmediately);
	    }
	    /**
	     * @deprecated `pan()` has been renamed to `truck()`
	     * @category Methods
	     */
	    pan(x, y, enableTransition = false) {
	        console.warn('`pan` has been renamed to `truck`');
	        return this.truck(x, y, enableTransition);
	    }
	    /**
	     * Truck and pedestal camera using current azimuthal angle
	     * @param x Horizontal translate amount
	     * @param y Vertical translate amount
	     * @param enableTransition Whether to move smoothly or immediately
	     * @category Methods
	     */
	    truck(x, y, enableTransition = false) {
	        this._camera.updateMatrix();
	        _xColumn.setFromMatrixColumn(this._camera.matrix, 0);
	        _yColumn.setFromMatrixColumn(this._camera.matrix, 1);
	        _xColumn.multiplyScalar(x);
	        _yColumn.multiplyScalar(-y);
	        const offset = _v3A$1.copy(_xColumn).add(_yColumn);
	        const to = _v3B$1.copy(this._targetEnd).add(offset);
	        return this.moveTo(to.x, to.y, to.z, enableTransition);
	    }
	    /**
	     * Move forward / backward.
	     * @param distance Amount to move forward / backward. Negative value to move backward
	     * @param enableTransition Whether to move smoothly or immediately
	     * @category Methods
	     */
	    forward(distance, enableTransition = false) {
	        _v3A$1.setFromMatrixColumn(this._camera.matrix, 0);
	        _v3A$1.crossVectors(this._camera.up, _v3A$1);
	        _v3A$1.multiplyScalar(distance);
	        const to = _v3B$1.copy(this._targetEnd).add(_v3A$1);
	        return this.moveTo(to.x, to.y, to.z, enableTransition);
	    }
	    /**
	     * Move up / down.
	     * @param height Amount to move up / down. Negative value to move down
	     * @param enableTransition Whether to move smoothly or immediately
	     * @category Methods
	     */
	    elevate(height, enableTransition = false) {
	        _v3A$1.copy(this._camera.up).multiplyScalar(height);
	        return this.moveTo(this._targetEnd.x + _v3A$1.x, this._targetEnd.y + _v3A$1.y, this._targetEnd.z + _v3A$1.z, enableTransition);
	    }
	    /**
	     * Move target position to given point.
	     * @param x x coord to move center position
	     * @param y y coord to move center position
	     * @param z z coord to move center position
	     * @param enableTransition Whether to move smoothly or immediately
	     * @category Methods
	     */
	    moveTo(x, y, z, enableTransition = false) {
	        this._isUserControllingTruck = false;
	        const offset = _v3A$1.set(x, y, z).sub(this._targetEnd);
	        this._encloseToBoundary(this._targetEnd, offset, this.boundaryFriction);
	        this._needsUpdate = true;
	        if (!enableTransition) {
	            this._target.copy(this._targetEnd);
	        }
	        const resolveImmediately = !enableTransition ||
	            approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) &&
	                approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) &&
	                approxEquals(this._target.z, this._targetEnd.z, this.restThreshold);
	        return this._createOnRestPromise(resolveImmediately);
	    }
	    /**
	     * Look in the given point direction.
	     * @param x point x.
	     * @param y point y.
	     * @param z point z.
	     * @param enableTransition Whether to move smoothly or immediately.
	     * @returns Transition end promise
	     * @category Methods
	     */
	    lookInDirectionOf(x, y, z, enableTransition = false) {
	        const point = _v3A$1.set(x, y, z);
	        const direction = point.sub(this._targetEnd).normalize();
	        const position = direction.multiplyScalar(-this._sphericalEnd.radius).add(this._targetEnd);
	        return this.setPosition(position.x, position.y, position.z, enableTransition);
	    }
	    /**
	     * Fit the viewport to the box or the bounding box of the object, using the nearest axis. paddings are in unit.
	     * set `cover: true` to fill enter screen.
	     * e.g.
	     * ```
	     * cameraControls.fitToBox( myMesh );
	     * ```
	     * @param box3OrObject Axis aligned bounding box to fit the view.
	     * @param enableTransition Whether to move smoothly or immediately.
	     * @param options | `<object>` { cover: boolean, paddingTop: number, paddingLeft: number, paddingBottom: number, paddingRight: number }
	     * @returns Transition end promise
	     * @category Methods
	     */
	    fitToBox(box3OrObject, enableTransition, { cover = false, paddingLeft = 0, paddingRight = 0, paddingBottom = 0, paddingTop = 0 } = {}) {
	        const promises = [];
	        const aabb = box3OrObject.isBox3
	            ? _box3A.copy(box3OrObject)
	            : _box3A.setFromObject(box3OrObject);
	        if (aabb.isEmpty()) {
	            console.warn('camera-controls: fitTo() cannot be used with an empty box. Aborting');
	            Promise.resolve();
	        }
	        // round to closest axis ( forward | backward | right | left | top | bottom )
	        const theta = roundToStep(this._sphericalEnd.theta, PI_HALF);
	        const phi = roundToStep(this._sphericalEnd.phi, PI_HALF);
	        promises.push(this.rotateTo(theta, phi, enableTransition));
	        const normal = _v3A$1.setFromSpherical(this._sphericalEnd).normalize();
	        const rotation = _quaternionA.setFromUnitVectors(normal, _AXIS_Z);
	        const viewFromPolar = approxEquals(Math.abs(normal.y), 1);
	        if (viewFromPolar) {
	            rotation.multiply(_quaternionB.setFromAxisAngle(_AXIS_Y, theta));
	        }
	        rotation.multiply(this._yAxisUpSpaceInverse);
	        // make oriented bounding box
	        const bb = _box3B.makeEmpty();
	        // left bottom back corner
	        _v3B$1.copy(aabb.min).applyQuaternion(rotation);
	        bb.expandByPoint(_v3B$1);
	        // right bottom back corner
	        _v3B$1.copy(aabb.min).setX(aabb.max.x).applyQuaternion(rotation);
	        bb.expandByPoint(_v3B$1);
	        // left top back corner
	        _v3B$1.copy(aabb.min).setY(aabb.max.y).applyQuaternion(rotation);
	        bb.expandByPoint(_v3B$1);
	        // right top back corner
	        _v3B$1.copy(aabb.max).setZ(aabb.min.z).applyQuaternion(rotation);
	        bb.expandByPoint(_v3B$1);
	        // left bottom front corner
	        _v3B$1.copy(aabb.min).setZ(aabb.max.z).applyQuaternion(rotation);
	        bb.expandByPoint(_v3B$1);
	        // right bottom front corner
	        _v3B$1.copy(aabb.max).setY(aabb.min.y).applyQuaternion(rotation);
	        bb.expandByPoint(_v3B$1);
	        // left top front corner
	        _v3B$1.copy(aabb.max).setX(aabb.min.x).applyQuaternion(rotation);
	        bb.expandByPoint(_v3B$1);
	        // right top front corner
	        _v3B$1.copy(aabb.max).applyQuaternion(rotation);
	        bb.expandByPoint(_v3B$1);
	        // add padding
	        bb.min.x -= paddingLeft;
	        bb.min.y -= paddingBottom;
	        bb.max.x += paddingRight;
	        bb.max.y += paddingTop;
	        rotation.setFromUnitVectors(_AXIS_Z, normal);
	        if (viewFromPolar) {
	            rotation.premultiply(_quaternionB.invert());
	        }
	        rotation.premultiply(this._yAxisUpSpace);
	        const bbSize = bb.getSize(_v3A$1);
	        const center = bb.getCenter(_v3B$1).applyQuaternion(rotation);
	        if (isPerspectiveCamera(this._camera)) {
	            const distance = this.getDistanceToFitBox(bbSize.x, bbSize.y, bbSize.z, cover);
	            promises.push(this.moveTo(center.x, center.y, center.z, enableTransition));
	            promises.push(this.dollyTo(distance, enableTransition));
	            promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
	        }
	        else if (isOrthographicCamera(this._camera)) {
	            const camera = this._camera;
	            const width = camera.right - camera.left;
	            const height = camera.top - camera.bottom;
	            const zoom = cover ? Math.max(width / bbSize.x, height / bbSize.y) : Math.min(width / bbSize.x, height / bbSize.y);
	            promises.push(this.moveTo(center.x, center.y, center.z, enableTransition));
	            promises.push(this.zoomTo(zoom, enableTransition));
	            promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
	        }
	        return Promise.all(promises);
	    }
	    /**
	     * Fit the viewport to the sphere or the bounding sphere of the object.
	     * @param sphereOrMesh
	     * @param enableTransition
	     * @category Methods
	     */
	    fitToSphere(sphereOrMesh, enableTransition) {
	        const promises = [];
	        const isObject3D = 'isObject3D' in sphereOrMesh;
	        const boundingSphere = isObject3D ?
	            CameraControls.createBoundingSphere(sphereOrMesh, _sphere) :
	            _sphere.copy(sphereOrMesh);
	        promises.push(this.moveTo(boundingSphere.center.x, boundingSphere.center.y, boundingSphere.center.z, enableTransition));
	        if (isPerspectiveCamera(this._camera)) {
	            const distanceToFit = this.getDistanceToFitSphere(boundingSphere.radius);
	            promises.push(this.dollyTo(distanceToFit, enableTransition));
	        }
	        else if (isOrthographicCamera(this._camera)) {
	            const width = this._camera.right - this._camera.left;
	            const height = this._camera.top - this._camera.bottom;
	            const diameter = 2 * boundingSphere.radius;
	            const zoom = Math.min(width / diameter, height / diameter);
	            promises.push(this.zoomTo(zoom, enableTransition));
	        }
	        promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
	        return Promise.all(promises);
	    }
	    /**
	     * Look at the `target` from the `position`.
	     * @param positionX
	     * @param positionY
	     * @param positionZ
	     * @param targetX
	     * @param targetY
	     * @param targetZ
	     * @param enableTransition
	     * @category Methods
	     */
	    setLookAt(positionX, positionY, positionZ, targetX, targetY, targetZ, enableTransition = false) {
	        this._isUserControllingRotate = false;
	        this._isUserControllingDolly = false;
	        this._isUserControllingTruck = false;
	        this._lastDollyDirection = DOLLY_DIRECTION.NONE;
	        this._changedDolly = 0;
	        const target = _v3B$1.set(targetX, targetY, targetZ);
	        const position = _v3A$1.set(positionX, positionY, positionZ);
	        this._targetEnd.copy(target);
	        this._sphericalEnd.setFromVector3(position.sub(target).applyQuaternion(this._yAxisUpSpace));
	        this.normalizeRotations();
	        this._needsUpdate = true;
	        if (!enableTransition) {
	            this._target.copy(this._targetEnd);
	            this._spherical.copy(this._sphericalEnd);
	        }
	        const resolveImmediately = !enableTransition ||
	            approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) &&
	                approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) &&
	                approxEquals(this._target.z, this._targetEnd.z, this.restThreshold) &&
	                approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) &&
	                approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold) &&
	                approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
	        return this._createOnRestPromise(resolveImmediately);
	    }
	    /**
	     * Similar to setLookAt, but it interpolates between two states.
	     * @param positionAX
	     * @param positionAY
	     * @param positionAZ
	     * @param targetAX
	     * @param targetAY
	     * @param targetAZ
	     * @param positionBX
	     * @param positionBY
	     * @param positionBZ
	     * @param targetBX
	     * @param targetBY
	     * @param targetBZ
	     * @param t
	     * @param enableTransition
	     * @category Methods
	     */
	    lerpLookAt(positionAX, positionAY, positionAZ, targetAX, targetAY, targetAZ, positionBX, positionBY, positionBZ, targetBX, targetBY, targetBZ, t, enableTransition = false) {
	        this._isUserControllingRotate = false;
	        this._isUserControllingDolly = false;
	        this._isUserControllingTruck = false;
	        this._lastDollyDirection = DOLLY_DIRECTION.NONE;
	        this._changedDolly = 0;
	        const targetA = _v3A$1.set(targetAX, targetAY, targetAZ);
	        const positionA = _v3B$1.set(positionAX, positionAY, positionAZ);
	        _sphericalA.setFromVector3(positionA.sub(targetA).applyQuaternion(this._yAxisUpSpace));
	        const targetB = _v3C$1.set(targetBX, targetBY, targetBZ);
	        const positionB = _v3B$1.set(positionBX, positionBY, positionBZ);
	        _sphericalB.setFromVector3(positionB.sub(targetB).applyQuaternion(this._yAxisUpSpace));
	        this._targetEnd.copy(targetA.lerp(targetB, t)); // tricky
	        const deltaTheta = _sphericalB.theta - _sphericalA.theta;
	        const deltaPhi = _sphericalB.phi - _sphericalA.phi;
	        const deltaRadius = _sphericalB.radius - _sphericalA.radius;
	        this._sphericalEnd.set(_sphericalA.radius + deltaRadius * t, _sphericalA.phi + deltaPhi * t, _sphericalA.theta + deltaTheta * t);
	        this.normalizeRotations();
	        this._needsUpdate = true;
	        if (!enableTransition) {
	            this._target.copy(this._targetEnd);
	            this._spherical.copy(this._sphericalEnd);
	        }
	        const resolveImmediately = !enableTransition ||
	            approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) &&
	                approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) &&
	                approxEquals(this._target.z, this._targetEnd.z, this.restThreshold) &&
	                approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) &&
	                approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold) &&
	                approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
	        return this._createOnRestPromise(resolveImmediately);
	    }
	    /**
	     * Set angle and distance by given position.
	     * An alias of `setLookAt()`, without target change. Thus keep gazing at the current target
	     * @param positionX
	     * @param positionY
	     * @param positionZ
	     * @param enableTransition
	     * @category Methods
	     */
	    setPosition(positionX, positionY, positionZ, enableTransition = false) {
	        return this.setLookAt(positionX, positionY, positionZ, this._targetEnd.x, this._targetEnd.y, this._targetEnd.z, enableTransition);
	    }
	    /**
	     * Set the target position where gaze at.
	     * An alias of `setLookAt()`, without position change. Thus keep the same position.
	     * @param targetX
	     * @param targetY
	     * @param targetZ
	     * @param enableTransition
	     * @category Methods
	     */
	    setTarget(targetX, targetY, targetZ, enableTransition = false) {
	        const pos = this.getPosition(_v3A$1);
	        const promise = this.setLookAt(pos.x, pos.y, pos.z, targetX, targetY, targetZ, enableTransition);
	        // see https://github.com/yomotsu/camera-controls/issues/335
	        this._sphericalEnd.phi = clamp(this._sphericalEnd.phi, this.minPolarAngle, this.maxPolarAngle);
	        return promise;
	    }
	    /**
	     * Set focal offset using the screen parallel coordinates. z doesn't affect in Orthographic as with Dolly.
	     * @param x
	     * @param y
	     * @param z
	     * @param enableTransition
	     * @category Methods
	     */
	    setFocalOffset(x, y, z, enableTransition = false) {
	        this._isUserControllingOffset = false;
	        this._focalOffsetEnd.set(x, y, z);
	        this._needsUpdate = true;
	        if (!enableTransition)
	            this._focalOffset.copy(this._focalOffsetEnd);
	        const resolveImmediately = !enableTransition ||
	            approxEquals(this._focalOffset.x, this._focalOffsetEnd.x, this.restThreshold) &&
	                approxEquals(this._focalOffset.y, this._focalOffsetEnd.y, this.restThreshold) &&
	                approxEquals(this._focalOffset.z, this._focalOffsetEnd.z, this.restThreshold);
	        return this._createOnRestPromise(resolveImmediately);
	    }
	    /**
	     * Set orbit point without moving the camera.
	     * SHOULD NOT RUN DURING ANIMATIONS. `setOrbitPoint()` will immediately fix the positions.
	     * @param targetX
	     * @param targetY
	     * @param targetZ
	     * @category Methods
	     */
	    setOrbitPoint(targetX, targetY, targetZ) {
	        this._camera.updateMatrixWorld();
	        _xColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 0);
	        _yColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 1);
	        _zColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 2);
	        const position = _v3A$1.set(targetX, targetY, targetZ);
	        const distance = position.distanceTo(this._camera.position);
	        const cameraToPoint = position.sub(this._camera.position);
	        _xColumn.multiplyScalar(cameraToPoint.x);
	        _yColumn.multiplyScalar(cameraToPoint.y);
	        _zColumn.multiplyScalar(cameraToPoint.z);
	        _v3A$1.copy(_xColumn).add(_yColumn).add(_zColumn);
	        _v3A$1.z = _v3A$1.z + distance;
	        this.dollyTo(distance, false);
	        this.setFocalOffset(-_v3A$1.x, _v3A$1.y, -_v3A$1.z, false);
	        this.moveTo(targetX, targetY, targetZ, false);
	    }
	    /**
	     * Set the boundary box that encloses the target of the camera. box3 is in THREE.Box3
	     * @param box3
	     * @category Methods
	     */
	    setBoundary(box3) {
	        if (!box3) {
	            this._boundary.min.set(-Infinity, -Infinity, -Infinity);
	            this._boundary.max.set(Infinity, Infinity, Infinity);
	            this._needsUpdate = true;
	            return;
	        }
	        this._boundary.copy(box3);
	        this._boundary.clampPoint(this._targetEnd, this._targetEnd);
	        this._needsUpdate = true;
	    }
	    /**
	     * Set (or unset) the current viewport.
	     * Set this when you want to use renderer viewport and .dollyToCursor feature at the same time.
	     * @param viewportOrX
	     * @param y
	     * @param width
	     * @param height
	     * @category Methods
	     */
	    setViewport(viewportOrX, y, width, height) {
	        if (viewportOrX === null) { // null
	            this._viewport = null;
	            return;
	        }
	        this._viewport = this._viewport || new THREE.Vector4();
	        if (typeof viewportOrX === 'number') { // number
	            this._viewport.set(viewportOrX, y, width, height);
	        }
	        else { // Vector4
	            this._viewport.copy(viewportOrX);
	        }
	    }
	    /**
	     * Calculate the distance to fit the box.
	     * @param width box width
	     * @param height box height
	     * @param depth box depth
	     * @returns distance
	     * @category Methods
	     */
	    getDistanceToFitBox(width, height, depth, cover = false) {
	        if (notSupportedInOrthographicCamera(this._camera, 'getDistanceToFitBox'))
	            return this._spherical.radius;
	        const boundingRectAspect = width / height;
	        const fov = this._camera.getEffectiveFOV() * DEG2RAD;
	        const aspect = this._camera.aspect;
	        const heightToFit = (cover ? boundingRectAspect > aspect : boundingRectAspect < aspect) ? height : width / aspect;
	        return heightToFit * 0.5 / Math.tan(fov * 0.5) + depth * 0.5;
	    }
	    /**
	     * Calculate the distance to fit the sphere.
	     * @param radius sphere radius
	     * @returns distance
	     * @category Methods
	     */
	    getDistanceToFitSphere(radius) {
	        if (notSupportedInOrthographicCamera(this._camera, 'getDistanceToFitSphere'))
	            return this._spherical.radius;
	        // https://stackoverflow.com/a/44849975
	        const vFOV = this._camera.getEffectiveFOV() * DEG2RAD;
	        const hFOV = Math.atan(Math.tan(vFOV * 0.5) * this._camera.aspect) * 2;
	        const fov = 1 < this._camera.aspect ? vFOV : hFOV;
	        return radius / (Math.sin(fov * 0.5));
	    }
	    /**
	     * Returns the orbit center position, where the camera looking at.
	     * @param out The receiving Vector3 instance to copy the result
	     * @param receiveEndValue Whether receive the transition end coords or current. default is `true`
	     * @category Methods
	     */
	    getTarget(out, receiveEndValue = true) {
	        const _out = !!out && out.isVector3 ? out : new THREE.Vector3();
	        return _out.copy(receiveEndValue ? this._targetEnd : this._target);
	    }
	    /**
	     * Returns the camera position.
	     * @param out The receiving Vector3 instance to copy the result
	     * @param receiveEndValue Whether receive the transition end coords or current. default is `true`
	     * @category Methods
	     */
	    getPosition(out, receiveEndValue = true) {
	        const _out = !!out && out.isVector3 ? out : new THREE.Vector3();
	        return _out.setFromSpherical(receiveEndValue ? this._sphericalEnd : this._spherical).applyQuaternion(this._yAxisUpSpaceInverse).add(receiveEndValue ? this._targetEnd : this._target);
	    }
	    /**
	     * Returns the spherical coordinates of the orbit.
	     * @param out The receiving Spherical instance to copy the result
	     * @param receiveEndValue Whether receive the transition end coords or current. default is `true`
	     * @category Methods
	     */
	    getSpherical(out, receiveEndValue = true) {
	        const _out = out || new THREE.Spherical();
	        return _out.copy(receiveEndValue ? this._sphericalEnd : this._spherical);
	    }
	    /**
	     * Returns the focal offset, which is how much the camera appears to be translated in screen parallel coordinates.
	     * @param out The receiving Vector3 instance to copy the result
	     * @param receiveEndValue Whether receive the transition end coords or current. default is `true`
	     * @category Methods
	     */
	    getFocalOffset(out, receiveEndValue = true) {
	        const _out = !!out && out.isVector3 ? out : new THREE.Vector3();
	        return _out.copy(receiveEndValue ? this._focalOffsetEnd : this._focalOffset);
	    }
	    /**
	     * Normalize camera azimuth angle rotation between 0 and 360 degrees.
	     * @category Methods
	     */
	    normalizeRotations() {
	        this._sphericalEnd.theta = this._sphericalEnd.theta % PI_2;
	        if (this._sphericalEnd.theta < 0)
	            this._sphericalEnd.theta += PI_2;
	        this._spherical.theta += PI_2 * Math.round((this._sphericalEnd.theta - this._spherical.theta) / PI_2);
	    }
	    /**
	     * stop all transitions.
	     */
	    stop() {
	        this._focalOffset.copy(this._focalOffsetEnd);
	        this._target.copy(this._targetEnd);
	        this._spherical.copy(this._sphericalEnd);
	        this._zoom = this._zoomEnd;
	    }
	    /**
	     * Reset all rotation and position to defaults.
	     * @param enableTransition
	     * @category Methods
	     */
	    reset(enableTransition = false) {
	        if (!approxEquals(this._camera.up.x, this._cameraUp0.x) ||
	            !approxEquals(this._camera.up.y, this._cameraUp0.y) ||
	            !approxEquals(this._camera.up.z, this._cameraUp0.z)) {
	            this._camera.up.copy(this._cameraUp0);
	            const position = this.getPosition(_v3A$1);
	            this.updateCameraUp();
	            this.setPosition(position.x, position.y, position.z);
	        }
	        const promises = [
	            this.setLookAt(this._position0.x, this._position0.y, this._position0.z, this._target0.x, this._target0.y, this._target0.z, enableTransition),
	            this.setFocalOffset(this._focalOffset0.x, this._focalOffset0.y, this._focalOffset0.z, enableTransition),
	            this.zoomTo(this._zoom0, enableTransition),
	        ];
	        return Promise.all(promises);
	    }
	    /**
	     * Set current camera position as the default position.
	     * @category Methods
	     */
	    saveState() {
	        this._cameraUp0.copy(this._camera.up);
	        this.getTarget(this._target0);
	        this.getPosition(this._position0);
	        this._zoom0 = this._zoom;
	        this._focalOffset0.copy(this._focalOffset);
	    }
	    /**
	     * Sync camera-up direction.
	     * When camera-up vector is changed, `.updateCameraUp()` must be called.
	     * @category Methods
	     */
	    updateCameraUp() {
	        this._yAxisUpSpace.setFromUnitVectors(this._camera.up, _AXIS_Y);
	        this._yAxisUpSpaceInverse.copy(this._yAxisUpSpace).invert();
	    }
	    /**
	     * Apply current camera-up direction to the camera.
	     * The orbit system will be re-initialized with the current position.
	     * @category Methods
	     */
	    applyCameraUp() {
	        const cameraDirection = _v3A$1.subVectors(this._target, this._camera.position).normalize();
	        // So first find the vector off to the side, orthogonal to both this.object.up and
	        // the "view" vector.
	        const side = _v3B$1.crossVectors(cameraDirection, this._camera.up);
	        // Then find the vector orthogonal to both this "side" vector and the "view" vector.
	        // This vector will be the new "up" vector.
	        this._camera.up.crossVectors(side, cameraDirection).normalize();
	        this._camera.updateMatrixWorld();
	        const position = this.getPosition(_v3A$1);
	        this.updateCameraUp();
	        this.setPosition(position.x, position.y, position.z);
	    }
	    /**
	     * Update camera position and directions.
	     * This should be called in your tick loop every time, and returns true if re-rendering is needed.
	     * @param delta
	     * @returns updated
	     * @category Methods
	     */
	    update(delta) {
	        const deltaTheta = this._sphericalEnd.theta - this._spherical.theta;
	        const deltaPhi = this._sphericalEnd.phi - this._spherical.phi;
	        const deltaRadius = this._sphericalEnd.radius - this._spherical.radius;
	        const deltaTarget = _deltaTarget.subVectors(this._targetEnd, this._target);
	        const deltaOffset = _deltaOffset.subVectors(this._focalOffsetEnd, this._focalOffset);
	        const deltaZoom = this._zoomEnd - this._zoom;
	        // update theta
	        if (approxZero(deltaTheta)) {
	            this._thetaVelocity.value = 0;
	            this._spherical.theta = this._sphericalEnd.theta;
	        }
	        else {
	            const smoothTime = this._isUserControllingRotate ? this.draggingSmoothTime : this.smoothTime;
	            this._spherical.theta = smoothDamp(this._spherical.theta, this._sphericalEnd.theta, this._thetaVelocity, smoothTime, Infinity, delta);
	            this._needsUpdate = true;
	        }
	        // update phi
	        if (approxZero(deltaPhi)) {
	            this._phiVelocity.value = 0;
	            this._spherical.phi = this._sphericalEnd.phi;
	        }
	        else {
	            const smoothTime = this._isUserControllingRotate ? this.draggingSmoothTime : this.smoothTime;
	            this._spherical.phi = smoothDamp(this._spherical.phi, this._sphericalEnd.phi, this._phiVelocity, smoothTime, Infinity, delta);
	            this._needsUpdate = true;
	        }
	        // update distance
	        if (approxZero(deltaRadius)) {
	            this._radiusVelocity.value = 0;
	            this._spherical.radius = this._sphericalEnd.radius;
	        }
	        else {
	            const smoothTime = this._isUserControllingDolly ? this.draggingSmoothTime : this.smoothTime;
	            this._spherical.radius = smoothDamp(this._spherical.radius, this._sphericalEnd.radius, this._radiusVelocity, smoothTime, this.maxSpeed, delta);
	            this._needsUpdate = true;
	        }
	        // update target position
	        if (approxZero(deltaTarget.x) && approxZero(deltaTarget.y) && approxZero(deltaTarget.z)) {
	            this._targetVelocity.set(0, 0, 0);
	            this._target.copy(this._targetEnd);
	        }
	        else {
	            const smoothTime = this._isUserControllingTruck ? this.draggingSmoothTime : this.smoothTime;
	            smoothDampVec3(this._target, this._targetEnd, this._targetVelocity, smoothTime, this.maxSpeed, delta, this._target);
	            this._needsUpdate = true;
	        }
	        // update focalOffset
	        if (approxZero(deltaOffset.x) && approxZero(deltaOffset.y) && approxZero(deltaOffset.z)) {
	            this._focalOffsetVelocity.set(0, 0, 0);
	            this._focalOffset.copy(this._focalOffsetEnd);
	        }
	        else {
	            const smoothTime = this._isUserControllingOffset ? this.draggingSmoothTime : this.smoothTime;
	            smoothDampVec3(this._focalOffset, this._focalOffsetEnd, this._focalOffsetVelocity, smoothTime, this.maxSpeed, delta, this._focalOffset);
	            this._needsUpdate = true;
	        }
	        // update zoom
	        if (approxZero(deltaZoom)) {
	            this._zoomVelocity.value = 0;
	            this._zoom = this._zoomEnd;
	        }
	        else {
	            const smoothTime = this._isUserControllingZoom ? this.draggingSmoothTime : this.smoothTime;
	            this._zoom = smoothDamp(this._zoom, this._zoomEnd, this._zoomVelocity, smoothTime, Infinity, delta);
	        }
	        if (this.dollyToCursor) {
	            if (isPerspectiveCamera(this._camera) && this._changedDolly !== 0) {
	                const dollyControlAmount = this._spherical.radius - this._lastDistance;
	                const camera = this._camera;
	                const cameraDirection = this._getCameraDirection(_cameraDirection);
	                const planeX = _v3A$1.copy(cameraDirection).cross(camera.up).normalize();
	                if (planeX.lengthSq() === 0)
	                    planeX.x = 1.0;
	                const planeY = _v3B$1.crossVectors(planeX, cameraDirection);
	                const worldToScreen = this._sphericalEnd.radius * Math.tan(camera.getEffectiveFOV() * DEG2RAD * 0.5);
	                const prevRadius = this._sphericalEnd.radius - dollyControlAmount;
	                const lerpRatio = (prevRadius - this._sphericalEnd.radius) / this._sphericalEnd.radius;
	                const cursor = _v3C$1.copy(this._targetEnd)
	                    .add(planeX.multiplyScalar(this._dollyControlCoord.x * worldToScreen * camera.aspect))
	                    .add(planeY.multiplyScalar(this._dollyControlCoord.y * worldToScreen));
	                const newTargetEnd = _v3A$1.copy(this._targetEnd).lerp(cursor, lerpRatio);
	                const isMin = this._lastDollyDirection === DOLLY_DIRECTION.IN && this._spherical.radius <= this.minDistance;
	                const isMax = this._lastDollyDirection === DOLLY_DIRECTION.OUT && this.maxDistance <= this._spherical.radius;
	                if (this.infinityDolly && (isMin || isMax)) {
	                    this._sphericalEnd.radius -= dollyControlAmount;
	                    this._spherical.radius -= dollyControlAmount;
	                    const dollyAmount = _v3B$1.copy(cameraDirection).multiplyScalar(-dollyControlAmount);
	                    newTargetEnd.add(dollyAmount);
	                }
	                // target position may be moved beyond boundary.
	                this._boundary.clampPoint(newTargetEnd, newTargetEnd);
	                const targetEndDiff = _v3B$1.subVectors(newTargetEnd, this._targetEnd);
	                this._targetEnd.copy(newTargetEnd);
	                this._target.add(targetEndDiff);
	                this._changedDolly -= dollyControlAmount;
	                if (approxZero(this._changedDolly))
	                    this._changedDolly = 0;
	            }
	            else if (isOrthographicCamera(this._camera) && this._changedZoom !== 0) {
	                const dollyControlAmount = this._zoom - this._lastZoom;
	                const camera = this._camera;
	                const worldCursorPosition = _v3A$1.set(this._dollyControlCoord.x, this._dollyControlCoord.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera);
	                const quaternion = _v3B$1.set(0, 0, -1).applyQuaternion(camera.quaternion);
	                const cursor = _v3C$1.copy(worldCursorPosition).add(quaternion.multiplyScalar(-worldCursorPosition.dot(camera.up)));
	                const prevZoom = this._zoom - dollyControlAmount;
	                const lerpRatio = -(prevZoom - this._zoom) / this._zoom;
	                // find the "distance" (aka plane constant in three.js) of Plane
	                // from a given position (this._targetEnd) and normal vector (cameraDirection)
	                // https://www.maplesoft.com/support/help/maple/view.aspx?path=MathApps%2FEquationOfAPlaneNormal#bkmrk0
	                const cameraDirection = this._getCameraDirection(_cameraDirection);
	                const prevPlaneConstant = this._targetEnd.dot(cameraDirection);
	                const newTargetEnd = _v3A$1.copy(this._targetEnd).lerp(cursor, lerpRatio);
	                const newPlaneConstant = newTargetEnd.dot(cameraDirection);
	                // Pull back the camera depth that has moved, to be the camera stationary as zoom
	                const pullBack = cameraDirection.multiplyScalar(newPlaneConstant - prevPlaneConstant);
	                newTargetEnd.sub(pullBack);
	                // target position may be moved beyond boundary.
	                this._boundary.clampPoint(newTargetEnd, newTargetEnd);
	                const targetEndDiff = _v3B$1.subVectors(newTargetEnd, this._targetEnd);
	                this._targetEnd.copy(newTargetEnd);
	                this._target.add(targetEndDiff);
	                // this._target.copy( this._targetEnd );
	                this._changedZoom -= dollyControlAmount;
	                if (approxZero(this._changedZoom))
	                    this._changedZoom = 0;
	            }
	        }
	        if (this._camera.zoom !== this._zoom) {
	            this._camera.zoom = this._zoom;
	            this._camera.updateProjectionMatrix();
	            this._updateNearPlaneCorners();
	            this._needsUpdate = true;
	        }
	        this._dragNeedsUpdate = true;
	        // collision detection
	        const maxDistance = this._collisionTest();
	        this._spherical.radius = Math.min(this._spherical.radius, maxDistance);
	        // decompose spherical to the camera position
	        this._spherical.makeSafe();
	        this._camera.position.setFromSpherical(this._spherical).applyQuaternion(this._yAxisUpSpaceInverse).add(this._target);
	        this._camera.lookAt(this._target);
	        // set offset after the orbit movement
	        const affectOffset = !approxZero(this._focalOffset.x) ||
	            !approxZero(this._focalOffset.y) ||
	            !approxZero(this._focalOffset.z);
	        if (affectOffset) {
	            this._camera.updateMatrixWorld();
	            _xColumn.setFromMatrixColumn(this._camera.matrix, 0);
	            _yColumn.setFromMatrixColumn(this._camera.matrix, 1);
	            _zColumn.setFromMatrixColumn(this._camera.matrix, 2);
	            _xColumn.multiplyScalar(this._focalOffset.x);
	            _yColumn.multiplyScalar(-this._focalOffset.y);
	            _zColumn.multiplyScalar(this._focalOffset.z); // notice: z-offset will not affect in Orthographic.
	            _v3A$1.copy(_xColumn).add(_yColumn).add(_zColumn);
	            this._camera.position.add(_v3A$1);
	        }
	        if (this._boundaryEnclosesCamera) {
	            this._encloseToBoundary(this._camera.position.copy(this._target), _v3A$1.setFromSpherical(this._spherical).applyQuaternion(this._yAxisUpSpaceInverse), 1.0);
	        }
	        const updated = this._needsUpdate;
	        if (updated && !this._updatedLastTime) {
	            this._hasRested = false;
	            this.dispatchEvent({ type: 'wake' });
	            this.dispatchEvent({ type: 'update' });
	        }
	        else if (updated) {
	            this.dispatchEvent({ type: 'update' });
	            if (approxZero(deltaTheta, this.restThreshold) &&
	                approxZero(deltaPhi, this.restThreshold) &&
	                approxZero(deltaRadius, this.restThreshold) &&
	                approxZero(deltaTarget.x, this.restThreshold) &&
	                approxZero(deltaTarget.y, this.restThreshold) &&
	                approxZero(deltaTarget.z, this.restThreshold) &&
	                approxZero(deltaOffset.x, this.restThreshold) &&
	                approxZero(deltaOffset.y, this.restThreshold) &&
	                approxZero(deltaOffset.z, this.restThreshold) &&
	                approxZero(deltaZoom, this.restThreshold) &&
	                !this._hasRested) {
	                this._hasRested = true;
	                this.dispatchEvent({ type: 'rest' });
	            }
	        }
	        else if (!updated && this._updatedLastTime) {
	            this.dispatchEvent({ type: 'sleep' });
	        }
	        this._lastDistance = this._spherical.radius;
	        this._lastZoom = this._zoom;
	        this._updatedLastTime = updated;
	        this._needsUpdate = false;
	        return updated;
	    }
	    /**
	     * Get all state in JSON string
	     * @category Methods
	     */
	    toJSON() {
	        return JSON.stringify({
	            enabled: this._enabled,
	            minDistance: this.minDistance,
	            maxDistance: infinityToMaxNumber(this.maxDistance),
	            minZoom: this.minZoom,
	            maxZoom: infinityToMaxNumber(this.maxZoom),
	            minPolarAngle: this.minPolarAngle,
	            maxPolarAngle: infinityToMaxNumber(this.maxPolarAngle),
	            minAzimuthAngle: infinityToMaxNumber(this.minAzimuthAngle),
	            maxAzimuthAngle: infinityToMaxNumber(this.maxAzimuthAngle),
	            smoothTime: this.smoothTime,
	            draggingSmoothTime: this.draggingSmoothTime,
	            dollySpeed: this.dollySpeed,
	            truckSpeed: this.truckSpeed,
	            dollyToCursor: this.dollyToCursor,
	            verticalDragToForward: this.verticalDragToForward,
	            target: this._targetEnd.toArray(),
	            position: _v3A$1.setFromSpherical(this._sphericalEnd).add(this._targetEnd).toArray(),
	            zoom: this._zoomEnd,
	            focalOffset: this._focalOffsetEnd.toArray(),
	            target0: this._target0.toArray(),
	            position0: this._position0.toArray(),
	            zoom0: this._zoom0,
	            focalOffset0: this._focalOffset0.toArray(),
	        });
	    }
	    /**
	     * Reproduce the control state with JSON. enableTransition is where anim or not in a boolean.
	     * @param json
	     * @param enableTransition
	     * @category Methods
	     */
	    fromJSON(json, enableTransition = false) {
	        const obj = JSON.parse(json);
	        this.enabled = obj.enabled;
	        this.minDistance = obj.minDistance;
	        this.maxDistance = maxNumberToInfinity(obj.maxDistance);
	        this.minZoom = obj.minZoom;
	        this.maxZoom = maxNumberToInfinity(obj.maxZoom);
	        this.minPolarAngle = obj.minPolarAngle;
	        this.maxPolarAngle = maxNumberToInfinity(obj.maxPolarAngle);
	        this.minAzimuthAngle = maxNumberToInfinity(obj.minAzimuthAngle);
	        this.maxAzimuthAngle = maxNumberToInfinity(obj.maxAzimuthAngle);
	        this.smoothTime = obj.smoothTime;
	        this.draggingSmoothTime = obj.draggingSmoothTime;
	        this.dollySpeed = obj.dollySpeed;
	        this.truckSpeed = obj.truckSpeed;
	        this.dollyToCursor = obj.dollyToCursor;
	        this.verticalDragToForward = obj.verticalDragToForward;
	        this._target0.fromArray(obj.target0);
	        this._position0.fromArray(obj.position0);
	        this._zoom0 = obj.zoom0;
	        this._focalOffset0.fromArray(obj.focalOffset0);
	        this.moveTo(obj.target[0], obj.target[1], obj.target[2], enableTransition);
	        _sphericalA.setFromVector3(_v3A$1.fromArray(obj.position).sub(this._targetEnd).applyQuaternion(this._yAxisUpSpace));
	        this.rotateTo(_sphericalA.theta, _sphericalA.phi, enableTransition);
	        this.dollyTo(_sphericalA.radius, enableTransition);
	        this.zoomTo(obj.zoom, enableTransition);
	        this.setFocalOffset(obj.focalOffset[0], obj.focalOffset[1], obj.focalOffset[2], enableTransition);
	        this._needsUpdate = true;
	    }
	    /**
	     * Attach all internal event handlers to enable drag control.
	     * @category Methods
	     */
	    connect(domElement) {
	        if (this._domElement) {
	            console.warn('camera-controls is already connected.');
	            return;
	        }
	        domElement.setAttribute('data-camera-controls-version', VERSION);
	        this._addAllEventListeners(domElement);
	        this._getClientRect(this._elementRect);
	    }
	    /**
	     * Detach all internal event handlers to disable drag control.
	     */
	    disconnect() {
	        this.cancel();
	        this._removeAllEventListeners();
	        if (this._domElement) {
	            this._domElement.removeAttribute('data-camera-controls-version');
	            this._domElement = undefined;
	        }
	    }
	    /**
	     * Dispose the cameraControls instance itself, remove all eventListeners.
	     * @category Methods
	     */
	    dispose() {
	        // remove all user event listeners
	        this.removeAllEventListeners();
	        // remove all internal event listeners
	        this.disconnect();
	    }
	    // it's okay to expose public though
	    _getTargetDirection(out) {
	        // divide by distance to normalize, lighter than `Vector3.prototype.normalize()`
	        return out.setFromSpherical(this._spherical).divideScalar(this._spherical.radius).applyQuaternion(this._yAxisUpSpaceInverse);
	    }
	    // it's okay to expose public though
	    _getCameraDirection(out) {
	        return this._getTargetDirection(out).negate();
	    }
	    _findPointerById(pointerId) {
	        return this._activePointers.find((activePointer) => activePointer.pointerId === pointerId);
	    }
	    _findPointerByMouseButton(mouseButton) {
	        return this._activePointers.find((activePointer) => activePointer.mouseButton === mouseButton);
	    }
	    _disposePointer(pointer) {
	        this._activePointers.splice(this._activePointers.indexOf(pointer), 1);
	    }
	    _encloseToBoundary(position, offset, friction) {
	        const offsetLength2 = offset.lengthSq();
	        if (offsetLength2 === 0.0) { // sanity check
	            return position;
	        }
	        // See: https://twitter.com/FMS_Cat/status/1106508958640988161
	        const newTarget = _v3B$1.copy(offset).add(position); // target
	        const clampedTarget = this._boundary.clampPoint(newTarget, _v3C$1); // clamped target
	        const deltaClampedTarget = clampedTarget.sub(newTarget); // newTarget -> clampedTarget
	        const deltaClampedTargetLength2 = deltaClampedTarget.lengthSq(); // squared length of deltaClampedTarget
	        if (deltaClampedTargetLength2 === 0.0) { // when the position doesn't have to be clamped
	            return position.add(offset);
	        }
	        else if (deltaClampedTargetLength2 === offsetLength2) { // when the position is completely stuck
	            return position;
	        }
	        else if (friction === 0.0) {
	            return position.add(offset).add(deltaClampedTarget);
	        }
	        else {
	            const offsetFactor = 1.0 + friction * deltaClampedTargetLength2 / offset.dot(deltaClampedTarget);
	            return position
	                .add(_v3B$1.copy(offset).multiplyScalar(offsetFactor))
	                .add(deltaClampedTarget.multiplyScalar(1.0 - friction));
	        }
	    }
	    _updateNearPlaneCorners() {
	        if (isPerspectiveCamera(this._camera)) {
	            const camera = this._camera;
	            const near = camera.near;
	            const fov = camera.getEffectiveFOV() * DEG2RAD;
	            const heightHalf = Math.tan(fov * 0.5) * near; // near plain half height
	            const widthHalf = heightHalf * camera.aspect; // near plain half width
	            this._nearPlaneCorners[0].set(-widthHalf, -heightHalf, 0);
	            this._nearPlaneCorners[1].set(widthHalf, -heightHalf, 0);
	            this._nearPlaneCorners[2].set(widthHalf, heightHalf, 0);
	            this._nearPlaneCorners[3].set(-widthHalf, heightHalf, 0);
	        }
	        else if (isOrthographicCamera(this._camera)) {
	            const camera = this._camera;
	            const zoomInv = 1 / camera.zoom;
	            const left = camera.left * zoomInv;
	            const right = camera.right * zoomInv;
	            const top = camera.top * zoomInv;
	            const bottom = camera.bottom * zoomInv;
	            this._nearPlaneCorners[0].set(left, top, 0);
	            this._nearPlaneCorners[1].set(right, top, 0);
	            this._nearPlaneCorners[2].set(right, bottom, 0);
	            this._nearPlaneCorners[3].set(left, bottom, 0);
	        }
	    }
	    // lateUpdate
	    _collisionTest() {
	        let distance = Infinity;
	        const hasCollider = this.colliderMeshes.length >= 1;
	        if (!hasCollider)
	            return distance;
	        if (notSupportedInOrthographicCamera(this._camera, '_collisionTest'))
	            return distance;
	        const rayDirection = this._getTargetDirection(_cameraDirection);
	        _rotationMatrix$1.lookAt(_ORIGIN$1, rayDirection, this._camera.up);
	        for (let i = 0; i < 4; i++) {
	            const nearPlaneCorner = _v3B$1.copy(this._nearPlaneCorners[i]);
	            nearPlaneCorner.applyMatrix4(_rotationMatrix$1);
	            const origin = _v3C$1.addVectors(this._target, nearPlaneCorner);
	            _raycaster.set(origin, rayDirection);
	            _raycaster.far = this._spherical.radius + 1;
	            const intersects = _raycaster.intersectObjects(this.colliderMeshes);
	            if (intersects.length !== 0 && intersects[0].distance < distance) {
	                distance = intersects[0].distance;
	            }
	        }
	        return distance;
	    }
	    /**
	     * Get its client rect and package into given `DOMRect` .
	     */
	    _getClientRect(target) {
	        if (!this._domElement)
	            return;
	        const rect = this._domElement.getBoundingClientRect();
	        target.x = rect.left;
	        target.y = rect.top;
	        if (this._viewport) {
	            target.x += this._viewport.x;
	            target.y += rect.height - this._viewport.w - this._viewport.y;
	            target.width = this._viewport.z;
	            target.height = this._viewport.w;
	        }
	        else {
	            target.width = rect.width;
	            target.height = rect.height;
	        }
	        return target;
	    }
	    _createOnRestPromise(resolveImmediately) {
	        if (resolveImmediately)
	            return Promise.resolve();
	        this._hasRested = false;
	        this.dispatchEvent({ type: 'transitionstart' });
	        return new Promise((resolve) => {
	            const onResolve = () => {
	                this.removeEventListener('rest', onResolve);
	                resolve();
	            };
	            this.addEventListener('rest', onResolve);
	        });
	    }
	    // eslint-disable-next-line @typescript-eslint/no-unused-vars
	    _addAllEventListeners(_domElement) { }
	    _removeAllEventListeners() { }
	    /**
	     * backward compatible
	     * @deprecated use smoothTime (in seconds) instead
	     * @category Properties
	     */
	    get dampingFactor() {
	        console.warn('.dampingFactor has been deprecated. use smoothTime (in seconds) instead.');
	        return 0;
	    }
	    /**
	     * backward compatible
	     * @deprecated use smoothTime (in seconds) instead
	     * @category Properties
	     */
	    set dampingFactor(_) {
	        console.warn('.dampingFactor has been deprecated. use smoothTime (in seconds) instead.');
	    }
	    /**
	     * backward compatible
	     * @deprecated use draggingSmoothTime (in seconds) instead
	     * @category Properties
	     */
	    get draggingDampingFactor() {
	        console.warn('.draggingDampingFactor has been deprecated. use draggingSmoothTime (in seconds) instead.');
	        return 0;
	    }
	    /**
	     * backward compatible
	     * @deprecated use draggingSmoothTime (in seconds) instead
	     * @category Properties
	     */
	    set draggingDampingFactor(_) {
	        console.warn('.draggingDampingFactor has been deprecated. use draggingSmoothTime (in seconds) instead.');
	    }
	    static createBoundingSphere(object3d, out = new THREE.Sphere()) {
	        const boundingSphere = out;
	        const center = boundingSphere.center;
	        _box3A.makeEmpty();
	        // find the center
	        object3d.traverseVisible((object) => {
	            if (!object.isMesh)
	                return;
	            _box3A.expandByObject(object);
	        });
	        _box3A.getCenter(center);
	        // find the radius
	        let maxRadiusSq = 0;
	        object3d.traverseVisible((object) => {
	            if (!object.isMesh)
	                return;
	            const mesh = object;
	            const geometry = mesh.geometry.clone();
	            geometry.applyMatrix4(mesh.matrixWorld);
	            const bufferGeometry = geometry;
	            const position = bufferGeometry.attributes.position;
	            for (let i = 0, l = position.count; i < l; i++) {
	                _v3A$1.fromBufferAttribute(position, i);
	                maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_v3A$1));
	            }
	        });
	        boundingSphere.radius = Math.sqrt(maxRadiusSq);
	        return boundingSphere;
	    }
	}

	const subsetOfTHREE = {
	    Vector2: three.Vector2,
	    Vector3: three.Vector3,
	    Vector4: three.Vector4,
	    Quaternion: three.Quaternion,
	    Matrix4: three.Matrix4,
	    Spherical: three.Spherical,
	    Box3: three.Box3,
	    Sphere: three.Sphere,
	    Raycaster: three.Raycaster,
	};
	CameraControls.install({ THREE: subsetOfTHREE });
	const _ORIGIN = new three.Vector3(0, 0, 0);
	const _v3A = new three.Vector3();
	const _v3B = new three.Vector3();
	const _v3C = new three.Vector3();
	const _ray = new three.Ray();
	const _rotationMatrix = new three.Matrix4();
	class TPSCameraControls extends CameraControls {
	    constructor(camera, trackObject, world, domElement) {
	        super(camera, domElement);
	        this.stopControl = false;
	        this.minDistance = 1;
	        this.maxDistance = 30;
	        this.azimuthRotateSpeed = 0.3; // negative value to invert rotation direction
	        this.polarRotateSpeed = -0.2; // negative value to invert rotation direction
	        this.minPolarAngle = 30 * three.MathUtils.DEG2RAD;
	        this.maxPolarAngle = 120 * three.MathUtils.DEG2RAD;
	        this.draggingSmoothTime = 1e-10;
	        this.mouseButtons.right = CameraControls.ACTION.NONE;
	        this.mouseButtons.middle = CameraControls.ACTION.NONE;
	        this.touches.two = CameraControls.ACTION.TOUCH_DOLLY;
	        this.touches.three = CameraControls.ACTION.TOUCH_DOLLY;
	        this.world = world;
	        this.colliderMeshes = [new three.Object3D()];
	        // this._trackObject = trackObject;
	        // this.offset = new Vector3( 0, 1, 0 );
	        const offset = new three.Vector3(0, 2, 0);
	        this.update = (delta) => {
	            if (!this.stopControl) {
	                const x = trackObject.position.x + offset.x;
	                const y = trackObject.position.y + offset.y;
	                const z = trackObject.position.z + offset.z;
	                this.moveTo(x, y, z, false);
	            }
	            return super.update(delta);
	        };
	    }
	    get frontAngle() {
	        return this.azimuthAngle;
	    }
	    _collisionTest() {
	        let distance = Infinity;
	        if (!this.world)
	            return distance;
	        for (let i = 0, l = this.world.colliderPool.length; i < l; i++) {
	            const octree = this.world.colliderPool[i];
	            const direction = _v3A.setFromSpherical(this._spherical).divideScalar(this._spherical.radius);
	            _rotationMatrix.lookAt(_ORIGIN, direction, this._camera.up);
	            for (let i = 0; i < 4; i++) {
	                const nearPlaneCorner = _v3B.copy(this._nearPlaneCorners[i]);
	                nearPlaneCorner.applyMatrix4(_rotationMatrix);
	                const origin = _v3C.addVectors(this._target, nearPlaneCorner);
	                _ray.set(origin, direction);
	                const intersect = octree.rayIntersect(_ray);
	                if (intersect && intersect.distance < distance) {
	                    distance = intersect.distance;
	                }
	            }
	        }
	        return distance;
	    }
	}

	exports.AnimationController = AnimationController;
	exports.CharacterController = CharacterController;
	exports.KeyInputControl = KeyInputControl;
	exports.Octree = Octree;
	exports.TPSCameraControls = TPSCameraControls;
	exports.World = World;

}));
