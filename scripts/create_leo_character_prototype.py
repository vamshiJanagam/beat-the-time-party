"""Create one original seated BEAT THE TIME character in Blender.

Writes a self-contained .blend scene, a transparent PNG render and a GLB into
character-workbench/leo-prototype. No external assets are used.
"""
import bpy, math, os
from mathutils import Vector

ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
OUT=os.path.join(ROOT,'character-workbench','leo-prototype')
os.makedirs(OUT,exist_ok=True)

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.materials,bpy.data.curves,bpy.data.meshes):
    for block in list(datablocks):
        if block.users==0: datablocks.remove(block)

def mat(name,color,rough=.48,metal=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    shader=m.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(*color,1);shader.inputs['Roughness'].default_value=rough;shader.inputs['Metallic'].default_value=metal
    return m

skin=mat('Warm honey skin',(0.78,.43,.29),.56);shirt=mat('Marigold hoodie',(1.0,.36,.025),.43)
hoodLining=mat('Hood lining - deep orange',(.36,.085,.018),.56);fabric=mat('Hoodie seam and cords',(1.0,.68,.24),.46)
denim=mat('Indigo trousers',(.025,.052,.115),.67);denimLight=mat('Denim seams',(.12,.22,.35),.59)
shoe=mat('Sneaker leather',(.055,.09,.15),.38);sole=mat('Sneaker foam',(.83,.88,.91),.6)
hair=mat('Espresso hair',(.055,.021,.014),.34);hairLight=mat('Hair highlights',(.18,.065,.025),.37)
white=mat('Eye ivory',(1.0,.92,.78),.24);iris=mat('Chestnut iris',(.19,.075,.025),.22);pupil=mat('Pupil',(.012,.009,.012),.15)
mouth=mat('Mouth interior',(.15,.025,.035),.56);teeth=mat('Smile',(1.0,.94,.80),.3);tongue=mat('Tongue',(0.72,.10,.16),.46)
accent=mat('Sun badge',(1.0,.72,.06),.31,.14)

def mesh(name,verts,faces,material,smooth=True):
    data=bpy.data.meshes.new(name+'Mesh');data.from_pydata(verts,[],faces);data.materials.append(material);data.update()
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob)
    if smooth:
        for poly in data.polygons:poly.use_smooth=True
    return ob

def loft(name,rings,material,seg=40):
    # Ring records are (height, center_x, center_y, radius_x, radius_y, rotation).
    verts=[];faces=[]
    for z,cx,cy,rx,ry,rot in rings:
        for j in range(seg):
            a=2*math.pi*j/seg;x=rx*math.cos(a);y=ry*math.sin(a)
            verts.append((cx+x*math.cos(rot)-y*math.sin(rot),cy+x*math.sin(rot)+y*math.cos(rot),z))
    for i in range(len(rings)-1):
        for j in range(seg):
            a=i*seg+j;b=i*seg+(j+1)%seg;faces.append((a,b,b+seg,a+seg))
    faces.append(tuple(range(seg-1,-1,-1)));faces.append(tuple((len(rings)-1)*seg+j for j in range(seg)))
    ob=mesh(name,verts,faces,material)
    sub=ob.modifiers.new('Silhouette smoothing','SUBSURF');sub.levels=1;sub.render_levels=1
    return ob

def orb(name,loc,scale,material,segments=32,rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(material)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for p in o.data.polygons:p.use_smooth=True
    return o

def tube(name,points,radii,material,sides=14):
    pts=[Vector(p) for p in points];verts=[];faces=[]
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)]).normalized()
        u=tangent.cross(Vector((0,0,1)))
        if u.length<.01:u=tangent.cross(Vector((0,1,0)))
        u.normalize();v=tangent.cross(u).normalized()
        for j in range(sides):
            q=p+radii[i]*(math.cos(j*2*math.pi/sides)*u+math.sin(j*2*math.pi/sides)*v);verts.append(tuple(q))
    for i in range(len(pts)-1):
        for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;faces.append((a,b,b+sides,a+sides))
    ob=mesh(name,verts,faces,material)
    sub=ob.modifiers.new('Soft tailored edges','SUBSURF');sub.levels=1;sub.render_levels=2
    return ob

def soft_panel(name,location,scale,material,bevel=.06):
    bpy.ops.mesh.primitive_cube_add(size=1,location=location);o=bpy.context.object;o.name=name;o.dimensions=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
    b=o.modifiers.new('Rounded fabric edge','BEVEL');b.width=bevel;b.segments=4
    o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
    return o

# A single root owns the entire character. Game-facing local forward is +Z;
# Blender scene forward is -Y, converted on the root before GLB export.
root=bpy.data.objects.new('BTT_Leo_Seated',None);bpy.context.collection.objects.link(root)
parts=[]
def own(o):parts.append(o);o.parent=root;return o

# Tailored seated hoodie torso and pelvis, built as continuous ring surfaces.
own(loft('Leo hoodie body',[(.92,0,0,.30,.25,0),(.98,0,0,.37,.29,0),(1.10,0,0,.40,.31,0),(1.37,0,0,.44,.32,0),(1.63,0,0,.43,.30,0),(1.78,0,0,.35,.26,0),(1.86,0,0,.19,.17,0)],shirt,56))
own(loft('Leo seated pelvis',[(.70,0,0,.32,.25,0),(.77,0,0,.41,.32,0),(.91,0,0,.40,.31,0),(1.00,0,0,.35,.27,0)],denim,48))
# Hood sits behind the neck, with an inner fabric opening and fine stitched piping.
own(tube('Leo hood outer seam',[(-.30,.10,1.72),(-.42,.18,1.91),(-.38,.22,2.13),(-.23,.24,2.28),(0,.24,2.33),(.23,.24,2.28),(.38,.22,2.13),(.42,.18,1.91),(.30,.10,1.72)],[.085,.10,.115,.12,.12,.12,.115,.10,.085],hoodLining,18))
own(tube('Leo hood piping',[(-.30,.015,1.80),(-.39,.09,1.98),(-.32,.12,2.15),(0,.13,2.26),(.32,.12,2.15),(.39,.09,1.98),(.30,.015,1.80)],[.022]*7,fabric,10))

# Legs bend at the knee with trouser volume, articulated seams and forward sneakers.
for side in (-1,1):
    x=side*.205
    own(tube('Leo trouser thigh',[(x,0,.84),(x,-.16,.78),(x,-.38,.66),(x,-.54,.59)],[.175,.17,.15,.125],denim,18))
    own(tube('Leo trouser shin',[(x,-.54,.59),(x,-.59,.46),(x,-.62,.28),(x,-.62,.19)],[.125,.12,.105,.11],denim,18))
    own(tube('Leo rolled cuff',[(x-.11,-.63,.27),(x,-.63,.25),(x+.11,-.63,.27)],[.023]*3,denimLight,10))
    own(orb('Leo sneaker sole',(x,-.81,.105),(.16,.32,.055),sole))
    own(orb('Leo sneaker upper',(x,-.82,.19),(.15,.28,.105),shoe))
    own(orb('Leo sneaker toe',(x,-1.0,.205),(.13,.12,.07),sole))
    # Small lace loops sit on the top plane of each sneaker.
    for k in range(3):
        yy=-.78-k*.055
        own(tube('Leo sneaker lace',[(x-.055,yy,.272),(x,yy-.018,.284),(x+.055,yy,.272)],[.009,.011,.009],fabric,8))

# Hoodie arms lean toward the tabletop and settle into a relaxed, playful pose.
for side in (-1,1):
    own(tube('Leo hoodie sleeve',[(side*.36,-.01,1.67),(side*.50,-.18,1.58),(side*.59,-.40,1.43),(side*.50,-.61,1.34)],[.18,.17,.145,.115],shirt,20))
    own(tube('Leo sleeve cuff',[(side*.49,-.61,1.35),(side*.44,-.64,1.34),(side*.39,-.66,1.34)],[.12,.11,.105],fabric,12))
    own(tube('Leo forearm',[(side*.44,-.65,1.34),(side*.34,-.78,1.32),(side*.21,-.91,1.32)],[.105,.09,.07],skin,16))
    own(orb('Leo hand',(side*.18,-.95,1.315),(.13,.12,.07),skin))
    # Finger forms fan subtly forward from the palms rather than reading as mittens.
    for finger in range(4):
        fx=side*.18+(finger-1.5)*.047
        own(tube('Leo finger',[(fx,-1.00,1.315),(fx,-1.09,1.30),(fx,-1.15,1.295)],[.026,.022,.012],skin,10))
    own(tube('Leo thumb',[(side*.09,-.96,1.32),(side*.07,-1.02,1.30),(side*.10,-1.07,1.295)],[.035,.027,.014],skin,10))
    # Gentle elbow folds catch light and sell the cloth shape.
    own(tube('Leo sleeve fold',[(side*.47,-.33,1.48),(side*.53,-.37,1.43),(side*.56,-.42,1.40)],[.012,.017,.012],fabric,8))

# Face and neck: soft jaw, wider brow, rounded cheeks and a clear silhouette.
own(loft('Leo neck',[(1.72,0,0,.12,.13,0),(1.90,0,0,.135,.14,0),(1.99,0,0,.15,.145,0)],skin,32))
headrings=[]
for i in range(21):
    a=-math.pi/2+math.pi*i/20;z=1.91+.84*(math.sin(a)+1)/2
    jaw=.76+.24*max(0,min(1,(z-1.91)/.27));profile=max(.015,math.cos(a))
    headrings.append((z,0,0,.355*profile*jaw,.315*profile,0))
own(loft('Leo sculpted head',headrings,skin,56))
for side in (-1,1):
    own(orb('Leo ear',(side*.355,0,2.12),(.095,.11,.14),skin))
    own(orb('Leo ear inner',(side*.397,-.045,2.12),(.038,.045,.074),mat('Ear blush',(0.54,.22,.18),.62),20,12))
    own(orb('Leo cheek',(side*.19,-.275,2.02),(.11,.035,.065),mat('Warm cheek',(0.93,.40,.31),.62),24,16))

# Large expressive eyes are recessed into the face; iris, pupils and catchlights are separate 3D surfaces.
for side in (-1,1):
    own(orb('Leo eye ivory',(side*.137,-.282,2.145),(.094,.050,.108),white))
    own(orb('Leo iris',(side*.132,-.326,2.138),(.050,.026,.062),iris,28,18))
    own(orb('Leo pupil',(side*.132,-.347,2.139),(.026,.014,.038),pupil,24,16))
    own(orb('Leo eye catchlight',(side*.148,-.359,2.166),(.014,.009,.018),teeth,16,12))
    own(tube('Leo eyelid',[ (side*.23,-.30,2.19),(side*.17,-.335,2.25),(side*.09,-.31,2.23)],[.018,.023,.016],hair,10))
    own(tube('Leo brow',[ (side*.23,-.285,2.30),(side*.15,-.31,2.33),(side*.075,-.30,2.31)],[.026,.037,.023],hair,10))

# A sculpted bridge and tip make the nose readable in three-quarter view.
own(loft('Leo nose',[(2.055,0,-.315,.018,.018,0),(2.075,0,-.335,.043,.045,0),(2.12,0,-.312,.032,.036,0),(2.19,0,-.283,.014,.015,0)],skin,24))
# Open friendly grin with lip edge, teeth row and tongue, all modeled as shallow forms.
own(orb('Leo open smile',(0,-.282,1.986),(.137,.035,.082),mouth,32,20))
own(soft_panel('Leo upper teeth',(0,-.320,2.015),(.18,.025,.036),teeth,.014))
own(orb('Leo lower lip',(0,-.31,1.947),(.082,.018,.018),tongue,20,12))

# Textured-looking hair silhouette with separated sculptural locks and fine highlight grooves.
own(loft('Leo hair cap',[(2.37,0,.015,.34,.29,0),(2.48,0,.005,.36,.30,0),(2.60,0,.025,.32,.27,0),(2.70,0,.06,.22,.19,0),(2.76,0,.08,.06,.055,0)],hair,48))
own(tube('Leo swept forelock',[(-.28,-.19,2.48),(-.21,-.30,2.59),(-.04,-.32,2.65),(.12,-.29,2.61),(.28,-.19,2.53)],[.11,.14,.15,.11,.035],hair,18))
own(tube('Leo side lock',[(-.30,-.13,2.52),(-.24,-.24,2.58),(-.08,-.31,2.57),(.08,-.30,2.55)],[.07,.095,.09,.025],hairLight,14))
for s in (-1,1):
    own(tube('Leo temple curl',[(s*.28,-.12,2.54),(s*.34,-.16,2.43),(s*.32,-.19,2.33)],[.075,.065,.025],hair,14))

# Hoodie front construction: a soft pocket, double-stitched opening, cords and tiny branded sun patch.
own(soft_panel('Leo kangaroo pocket',(0,-.314,1.15),(.39,.035,.22),shirt,.075))
for side in (-1,1):
    own(tube('Leo pocket topstitch',[(side*.17,-.337,1.24),(side*.17,-.339,1.13),(side*.12,-.339,1.07)],[.008]*3,fabric,8))
    own(tube('Leo hoodie cord',[(side*.045,-.24,1.72),(side*.055,-.30,1.58),(side*.055,-.32,1.43)],[.012,.014,.011],fabric,10))
    own(orb('Leo cord tip',(side*.055,-.325,1.41),(.018,.014,.025),accent,16,10))
own(orb('Leo sun badge',(-.27,-.315,1.56),(.055,.022,.055),accent,24,16))
for i in range(8):
    a=math.pi*2*i/8
    own(tube('Leo badge ray',[(-.27+math.cos(a)*.065,-.315,1.56+math.sin(a)*.065),(-.27+math.cos(a)*.082,-.315,1.56+math.sin(a)*.082)],[.008,.006],accent,8))

# Parent all meshes to one exportable node. A temporary quarter-turn converts
# Blender Z-up into the game's Y-up export frame without rotating the saved scene.
for part in parts:part.parent=root

# Studio stage, light rig and full-body camera are kept editable in the .blend.
world=bpy.data.worlds.new('Midnight studio') if not bpy.data.worlds else bpy.data.worlds[0]
world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.018,.03,.07,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.34;bpy.context.scene.world=world
floor=mat('Studio floor',(.025,.04,.085),.72)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.025));ground=bpy.context.object;ground.name='Studio ground';ground.data.materials.append(floor)
def area(name,loc,power,color,size,target):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Z').to_euler()
area('Warm key',(-3,-4,5),480,(1,.74,.46),4,(0,0,1.5))
area('Cool fill',(3,-3,3),310,(.35,.64,1),3,(0,0,1.5))
area('Violet rim',(1,2,4),650,(.55,.22,1),2.4,(0,0,1.7))
camdata=bpy.data.cameras.new('Leo portrait camera');cam=bpy.data.objects.new('Leo portrait camera',camdata);bpy.context.collection.objects.link(cam)
cam.location=(2.8,-8.4,2.65);cam.rotation_euler=(Vector((0,-.12,1.38))-cam.location).to_track_quat('-Z','Z').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=3.48;bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE';scene.eevee.taa_render_samples=96
scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True;scene.render.filepath=os.path.join(OUT,'leo-seated-preview.png')
scene.view_settings.view_transform='AgX';scene.render.image_settings.color_mode='RGBA'
root.rotation_euler.x=math.pi/2
bpy.ops.object.select_all(action='DESELECT')
for obj in parts:obj.select_set(True)
root.select_set(True);bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'leo-seated.glb'),export_format='GLB',use_selection=True,export_apply=True)
root.rotation_euler.x=0
# The chair and table are presentation props only; neither is part of the GLB character.
chairFrame=mat('Chair frame - ink blue',(.018,.045,.105),.32,.18)
chairPad=mat('Chair upholstery - cobalt',(.025,.12,.31),.55)
tableTop=mat('Tabletop - warm walnut',(.25,.085,.025),.3,.04)
tableEdge=mat('Table edge - amber',(.95,.37,.035),.28,.16)
own_prop=[]
def stage_cube(name,loc,dims,material,bevel):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
    b=o.modifiers.new('Soft presentation edge','BEVEL');b.width=bevel;b.segments=4;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');own_prop.append(o);return o
stage_cube('Chair seat shell',(0,.18,.73),(.96,.72,.15),chairFrame,.11)
stage_cube('Chair seat cushion',(0,.12,.825),(.82,.58,.11),chairPad,.13)
stage_cube('Chair back shell',(0,.48,1.19),(.96,.18,.78),chairFrame,.13)
stage_cube('Chair back cushion',(0,.365,1.20),(.79,.13,.62),chairPad,.12)
for side in (-1,1):
    own_prop.append(tube('Chair front leg',[(side*.39,-.13,.70),(side*.39,-.10,.06)],[.035,.028],chairFrame,12))
    own_prop.append(tube('Chair rear leg',[(side*.39,.40,.69),(side*.39,.48,.07)],[.035,.028],chairFrame,12))
bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=1.48,depth=.13,location=(0,-1.63,1.24));table=bpy.context.object;table.name='Tabletop - render prop';table.data.materials.append(tableTop)
bev=table.modifiers.new('Polished rounded rim','BEVEL');bev.width=.05;bev.segments=4;table.modifiers.new('Weighted normals','WEIGHTED_NORMAL');own_prop.append(table)
bpy.ops.mesh.primitive_torus_add(major_radius=1.47,minor_radius=.022,major_segments=96,minor_segments=12,location=(0,-1.63,1.24));rim=bpy.context.object;rim.name='Amber table inlay';rim.data.materials.append(tableEdge);own_prop.append(rim)
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'leo-seated.blend'))
print('Created standalone Leo character prototype at',OUT)
