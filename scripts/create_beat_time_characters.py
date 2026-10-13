"""Build original, seated BEAT THE TIME character meshes and export GLB files.

Run with Blender 5.x in background mode. This script uses no external assets.
"""
import bpy
import math
import os
from mathutils import Vector

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'character-workbench', 'original'))
os.makedirs(OUT, exist_ok=True)

CAST = [
    ('m1','Kai',(0.04,0.32,0.96),'swept',0.22), ('m2','Leo',(1.00,0.38,0.035),'spikes',0.15),
    ('m3','Max',(0.015,0.59,0.27),'curls',0.12), ('m4','Arjun',(0.40,0.12,0.82),'sidepart',0.18),
    ('m5','Noah',(0.91,0.055,0.19),'cap',0.10), ('m6','Ethan',(0.015,0.59,0.69),'undercut',0.13),
    ('f1','Mia',(0.96,0.035,0.39),'long',0.22), ('f2','Zoe',(0.035,0.29,0.96),'ponytail',0.16),
    ('f3','Ava',(0.48,0.075,0.91),'bob',0.14), ('f4','Nina',(0.02,0.59,0.28),'curls',0.12),
    ('f5','Sara',(1.00,0.30,0.015),'long',0.18), ('f6','Ivy',(0.015,0.58,0.65),'twin',0.14),
]
OUTFITS=['hoodie','varsity','sport','jacket','team','zip','hoodie','sport','jacket','tee','sweater','zip']
SKINS=[(0.96,.69,.52,1),(.72,.42,.28,1),(.88,.57,.41,1),(.57,.32,.23,1),(.83,.52,.39,1),(.68,.43,.32,1)]
HAIRS=[(.12,.055,.035,1),(.20,.075,.035,1),(.055,.035,.025,1),(.24,.10,.045,1),(.40,.12,.045,1),(.08,.045,.03,1)]

def material(name, color, rough=.48, metallic=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color[:3],color[3] if len(color)>3 else 1)
    m.use_nodes=True; p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=m.diffuse_color
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metallic
    return m

def mesh_obj(name, verts, faces, mat, smooth=True):
    me=bpy.data.meshes.new(name+'Mesh'); me.from_pydata(verts,[],faces); me.materials.append(mat); me.update()
    ob=bpy.data.objects.new(name,me); bpy.context.collection.objects.link(ob)
    if smooth:
        for p in me.polygons:p.use_smooth=True
    return ob

def loft(name, rings, mat, segments=24):
    """Organic ring loft; ring tuple is (z, center_x, center_y, rx, ry, rotation)."""
    verts=[]; faces=[]
    for z,cx,cy,rx,ry,rot in rings:
        for j in range(segments):
            a=2*math.pi*j/segments; x=rx*math.cos(a); y=ry*math.sin(a)
            verts.append((cx+x*math.cos(rot)-y*math.sin(rot),z,cy+x*math.sin(rot)+y*math.cos(rot)))
    for i in range(len(rings)-1):
        for j in range(segments):a=i*segments+j;b=i*segments+(j+1)%segments;faces.append((a,b,b+segments,a+segments))
    faces.append(tuple(range(segments-1,-1,-1)));faces.append(tuple((len(rings)-1)*segments+j for j in range(segments)))
    return mesh_obj(name,verts,faces,mat)

def ellipsoid(name, loc, scale, mat, seg=24, rings=16):
    # Deformed UV topology is used for facial and clothing forms, not flat billboards.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for p in o.data.polygons:p.use_smooth=True
    return o

def tube(name, points, radii, mat, sides=12):
    pts=[Vector(p) for p in points]; verts=[];faces=[]
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)]).normalized()
        u=tangent.cross(Vector((0,1,0)))
        if u.length<.01:u=tangent.cross(Vector((1,0,0)))
        u.normalize();v=tangent.cross(u).normalized()
        for j in range(sides):
            q=p+radii[i]*(math.cos(j*2*math.pi/sides)*u+math.sin(j*2*math.pi/sides)*v);verts.append(tuple(q))
    for i in range(len(pts)-1):
        for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;faces.append((a,b,b+sides,a+sides))
    return mesh_obj(name,verts,faces,mat)

def make_character(data, idx):
    cid,name,shirt_rgb,style,accent=data
    existing=set(bpy.context.scene.objects)
    skin=material('Skin - '+name,SKINS[idx%len(SKINS)],.58);hair=material('Hair - '+name,HAIRS[idx%len(HAIRS)],.36)
    shirt=material('Outfit - '+name,(*shirt_rgb,1),.43);trim=material('Outfit trim - '+name,(min(1,shirt_rgb[0]+.32),min(1,shirt_rgb[1]+.30),min(1,shirt_rgb[2]+.27),1),.38)
    pants=material('Denim - '+name,(.055,.09,.17,1),.68);shoe=material('Sneakers - '+name,(.045,.065,.095,1),.38)
    white=material('Eye whites',(1,.93,.83,1),.24);iris=material('Iris',(0.20,.095,.045,1),.27);black=material('Pupils',(0.018,.012,.015,1),.16);mouth=material('Smile',(0.30,.055,.065,1),.45)
    gold=material('Accent stitching',(1,.66,.12,1),.34,.05)
    # Seated body: hips and torso are shaped loft meshes; legs are bent, tapered surfaces.
    build=1+(.07 if idx in (1,4,8) else -.035 if idx in (0,6,10) else 0)
    loft(name+' seated torso',[(.89,0,0,.29*build,.24,0),(.98,0,0,.37*build,.28,0),(1.15,0,0,.39*build,.29,0),(1.42,0,0,.46*build,.31,0),(1.65,0,0,.44*build,.28,0),(1.78,0,0,.32*build,.23,0),(1.84,0,0,.18,.16,0)],shirt,48)
    loft(name+' seated hips',[(.70,0,0,.32,.23,0),(.78,0,0,.41,.31,0),(.93,0,0,.41,.31,0),(1.02,0,0,.35,.27,0)],pants,32)
    # Upper legs angle forward to the table; lower legs drop from the knees.
    for s in (-1,1):
        x=s*.205
        tube(name+' thigh',[(x,.83,.08),(x,.77,.30),(x,.67,.52),(x,.61,.62)],[.17,.17,.145,.12],pants,16)
        tube(name+' shin',[(x,.61,.62),(x,.48,.62),(x,.29,.58),(x,.20,.58)],[.12,.115,.105,.11],pants,16)
        ellipsoid(name+' sneaker',(x,.16,.70),(.15,.115,.27),shoe)
        ellipsoid(name+' sneaker toe',(x,.15,.89),(.14,.085,.12),trim)
        # arms reach forward and rest naturally at the table edge
        tube(name+' sleeve',[(s*.38,1.63,.00),(s*.53,1.53,.10),(s*.59,1.35,.28),(s*.49,1.24,.49)],[.18,.17,.145,.12],shirt,16)
        tube(name+' forearm',[(s*.49,1.24,.49),(s*.42,1.19,.62),(s*.29,1.18,.70)],[.11,.095,.075],skin,14)
        ellipsoid(name+' hand',(s*.27,1.17,.73),(.12,.065,.14),skin)
        ellipsoid(name+' ear',(s*.375,2.09,.00),(.09,.14,.10),skin)
    # Neck and a custom jaw/cheek head mesh, broader above the chin.
    loft(name+' neck',[(1.72,0,0,.105,.11,0),(1.86,0,0,.12,.12,0),(1.97,0,0,.13,.13,0)],skin,24)
    headrings=[]
    for i in range(17):
        a=-math.pi/2+math.pi*i/16; z=1.91+0.43*(math.sin(a)+1)
        profile=math.cos(a); jaw=.78+.22*max(0,min(1,(z-1.91)/.18))
        headrings.append((z,0,0,.34*profile*jaw,.29*profile,0))
    loft(name+' shaped head',headrings,skin,40)
    # Eyes have raised sockets, iris and catchlights for readability at table distance.
    iris_colors=[(.16,.35,.55,1),(.20,.095,.045,1),(.12,.32,.18,1),(.30,.18,.08,1)]
    iris=material('Iris - '+name,iris_colors[idx%len(iris_colors)],.25)
    eye_scale=1.04 if idx%3==0 else .96 if idx%3==1 else 1
    for s in (-1,1):
        ellipsoid(name+' eye white',(s*.135,2.105,.255),(.09*eye_scale,.105*eye_scale,.052),white)
        ellipsoid(name+' iris',(s*.132,2.095,.300),(.045,.055,.021),iris,20,12)
        ellipsoid(name+' pupil',(s*.132,2.095,.317),(.023,.034,.012),black,16,10)
        ellipsoid(name+' eye glint',(s*.145,2.119,.328),(.012,.016,.007),white,12,8)
        browlift=.02 if idx%4==0 else -.01 if idx%4==2 else 0
        tube(name+' expressive brow',[(s*.23,2.25+browlift,.252),(s*.14,2.29+browlift,.278),(s*.07,2.27+browlift,.285)],[.024,.032,.02],hair,10)
    tube(name+' smile', [(-.09,1.99,.283),(-.045,1.965,.306),(0,1.96,.31),(.05,1.965,.306),(.09,1.99,.283)],[.012,.018,.02,.018,.012],mouth,10)
    ellipsoid(name+' nose',(0,2.055,.302),(.05,.055,.07),skin,18,12)
    # Hair cap follows the skull and hairstyle-specific locks create a distinctive silhouette.
    cap=[]
    for i in range(9):
        a=-.05+1.48*i/8; z=2.25+.22*math.sin(a); r=.345*math.cos(a)
        cap.append((2.52+.25*math.sin(a),0,0,r,.305*math.cos(a),0))
    loft(name+' hair cap',cap,hair,40)
    if style in ('long','bob','ponytail','twin'):
        for s in (-1,1):
            end=1.47 if style=='long' else 1.67 if style in ('ponytail','twin') else 1.96
            tube(name+' flowing hair',[(s*.25,2.50,-.08),(s*.36,2.32,-.10),(s*.38,2.05,-.04),(s*.31,end,.02)],[.13,.14,.12,.07],hair,18)
        if style in ('long','ponytail','twin'):
            loft(name+' back hair',[(1.55,0,-.20,.25,.12,0),(1.90,0,-.20,.34,.12,0),(2.25,0,-.18,.35,.11,0),(2.48,0,-.10,.28,.10,0)],hair,32)
    if style=='ponytail':
        tube(name+' ponytail',[(0,2.39,-.25),(.04,2.25,-.40),(.08,1.98,-.43),(.16,1.72,-.37)],[.13,.12,.09,.035],hair,16)
        ellipsoid(name+' hair tie',(.02,2.32,-.31),(.07,.07,.07),gold,16,12)
    if style=='twin':
        for s in (-1,1):tube(name+' twin tail',[(s*.32,2.22,-.03),(s*.45,2.08,-.12),(s*.48,1.85,-.12),(s*.43,1.64,-.08)],[.095,.105,.08,.025],hair,16)
    if style in ('swept','sidepart','spikes'):
        tube(name+' swept lock',[(-.25,2.52,.04),(-.13,2.64,.12),(.06,2.66,.11),(.25,2.57,.05)],[.12,.14,.12,.045],hair,16)
    if style=='spikes':
        for x in (-.20,-.07,.07,.19):tube(name+' hair spike',[(x,2.55,0),(x*1.1,2.66,.015),(x*1.2,2.76,.005)],[.085,.06,.008],hair,12)
    if style=='curls':
        for row in range(2):
            for j in range(7):
                x=-.28+j*.093; z=2.54-row*.075; y=.06+(.02 if j%2 else 0)
                ellipsoid(name+' curl',(x,z,y),(.075,.075,.075),hair,16,12)
    if style=='cap':
        capmat=material('Cap blue',(0.04,.16,.65,1),.38)
        ellipsoid(name+' cap crown',(0,2.37,.015),(.36,.14,.31),capmat,32,20)
        ellipsoid(name+' cap brim',(0,2.31,.24),(.33,.045,.22),capmat,32,16)
        ellipsoid(name+' cap badge',(0,2.37,.31),(.075,.06,.018),gold,16,10)
    if style in ('undercut','ponytail'):
        for s in (-1,1):ellipsoid(name+' tied hair',(s*.12,2.16,-.27),(.12,.13,.13),hair)
    # Tailored seams, hoodie cords and pocket add a designed game-cast finish.
    tube(name+' hoodie cord L',[(-.045,1.72,.245),(-.05,1.55,.275),(-.05,1.44,.29)],[.012,.012,.01],trim,8)
    tube(name+' hoodie cord R',[(.045,1.72,.245),(.05,1.55,.275),(.05,1.44,.29)],[.012,.012,.01],trim,8)
    outfit=OUTFITS[idx]
    if outfit in ('hoodie','sweater'):
        loft(name+' kangaroo pocket',[(1.02,0,.255,.21,.018,0),(1.07,0,.27,.25,.018,0),(1.25,0,.27,.23,.018,0)],trim,32)
    if outfit in ('varsity','jacket','zip'):
        tube(name+' jacket zipper',[(0,1.76,.215),(0,1.50,.30),(0,1.20,.29),(0,.98,.245)],[.014]*4,gold if outfit=='varsity' else trim,8)
        for s in (-1,1):
            tube(name+' lapel seam',[(s*.08,1.74,.20),(s*.15,1.62,.255),(s*.09,1.51,.29)],[.018,.022,.012],trim,8)
    if outfit in ('sport','team'):
        loft(name+' chest stripe',[(1.39,0,.292,.405,.014,0),(1.47,0,.30,.42,.014,0)],trim,40)
        for s in (-1,1):tube(name+' shoulder stripe',[(s*.38,1.67,.10),(s*.44,1.57,.10),(s*.45,1.47,.10)],[.025]*3,trim,10)
    if outfit=='sweater':
        for y in (1.34,1.39,1.44):tube(name+' knit band',[(-.34,y,.20),(0,y,.30),(.34,y,.20)],[.012]*3,gold,8)
    if outfit=='tee':
        for s in (-1,1):ellipsoid(name+' tee sleeve patch',(s*.39,1.58,.14),(.055,.075,.03),gold,16,10)
    if outfit=='team':
        ellipsoid(name+' team badge',(-.25,1.57,.27),(.075,.085,.025),gold,20,12)
    if idx in (3,8):
        frame=material('Glasses frame - '+name,(.055,.035,.025,1),.30,.18)
        for s in (-1,1):
            # Thin curved rims sit just proud of each eye; these are modeled accessories.
            tube(name+' glasses rim',[(s*.24,2.17,.284),(s*.20,2.22,.30),(s*.10,2.22,.30),(s*.055,2.17,.284),(s*.10,2.12,.284),(s*.20,2.12,.284),(s*.24,2.17,.284)],[.011]*7,frame,8)
        tube(name+' glasses bridge',[(-.055,2.18,.29),(0,2.19,.30),(.055,2.18,.29)],[.01]*3,frame,8)
    # Parent all geometry beneath one root for clean GLB placement.
    root=bpy.data.objects.new('BTT_'+cid+'_'+name,None);bpy.context.collection.objects.link(root)
    for obj in list(bpy.context.scene.objects):
        if obj!=root and obj not in existing: obj.parent=root
    root.rotation_euler.x=math.pi/2
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj==root or (obj not in existing and obj.parent==root): obj.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,cid+'.glb'),export_format='GLB',use_selection=True,export_apply=True)
    root.location.x=(idx%6-2.5)*1.58
    root.location.y=0
    root.location.z=-(idx//6)*3.0
    return root

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for index, character in enumerate(CAST):
    make_character(character,index)
    print('Exported',character[0],character[1])

# Render an informative contact sheet for visual review.
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE';scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(OUT,'character-cast-preview.png')
scene.world.color=(.025,.035,.065)
def area(name,loc,power,color,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector((0,1.25,0))-ob.location).to_track_quat('-Z','Y').to_euler()
area('Key softbox',(3,-5,5),230,(1,.78,.58),5);area('Cool fill',(-4,-3,3),110,(.40,.68,1),4);area('Rim',(1,3,4),300,(.48,.25,1),3)
camdata=bpy.data.cameras.new('Cast Camera');cam=bpy.data.objects.new('Cast Camera',camdata);scene.collection.objects.link(cam);cam.location=(0,-10.5,2.55);cam.rotation_euler=(Vector((0,0,1.25))-cam.location).to_track_quat('-Z','Z').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=11.8;scene.camera=cam
scene.render.film_transparent=False
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'character-cast.blend'))
