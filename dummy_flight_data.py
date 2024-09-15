import json
import math

# Initialize flight card
ast_data = {
    "flight_card": {
        "rocket_name": "AeroSentinel X1",
        "motor_used": "Cesaroni 06000",
        "flyer": "Yassine Dehhani",
        "flight_date": "2023-10-01",
        "location": "Desert Launch Site",
        "flight_computer": "FC-1000"
    },
    "telemetry": []
}

# Flight parameters
total_time = 60.0  # Extended simulation time to 60 seconds
time_step = 0.05  # 50 ms intervals
num_points = int(total_time / time_step)

# Constants
g = 9.81  # Gravity, m/s^2

# Adjusted rocket parameters
burn_time = 3.0  # Motor burns for 3 seconds
thrust = 5000.0  # Reduced thrust in Newtons
mass_initial = 100.0  # Increased initial mass in kg
mass_propellant = 30.0  # Adjusted propellant mass in kg
mass_flow_rate = mass_propellant / burn_time  # kg/s

# Initial conditions
time = 0.0
mass = mass_initial
position = 0.0  # Altitude in meters
velocity = 0.0  # m/s
acceleration = 0.0  # m/s^2

# Initialize sensor readings (same as before)
orientation = [0.0, 0.0, 0.0]
orientation_q = [0.0, 0.0, 0.0]
accel_bno = [0.0, 0.0, 0.0]
gyro = [0.0, 0.0, 0.0]
gravity_vector = [0.0, 0.0, -g]
magnetometer = [30.0, 0.0, 45.0]
temperature = 20.0  # Celsius
quaternion = {"w": 1.0, "x": 0.0, "y": 0.0, "z": 0.0}
pressure_sea_level = 101325  # Pa
latitude = 35.0
longitude = -115.0

# Event flags initialization
events = {
    "takeoff_detection": False,
    "ascent": False,
    "coasting": False,
    "apogee": False,
    "parachute_ejection": False,
    "descent": False,
    "recovery": False
}

# Event occurrence flags
event_occurred = {
    "takeoff_detection": False,
    "apogee": False,
    "parachute_ejection": False,
    "recovery": False
}

# Initialize time_of_apogee
time_of_apogee = None

# For detecting apogee
previous_altitude = position

# Generate data for each timestep
for i in range(num_points):
    # Update time
    time += time_step

    # Update mass
    if time <= burn_time:
        mass -= mass_flow_rate * time_step

    # Calculate net force
    if time <= burn_time:
        thrust_force = thrust
    else:
        thrust_force = 0.0

    weight = mass * g
    net_force = thrust_force - weight

    # Calculate acceleration
    acceleration = net_force / mass  # m/s^2

    # Update velocity and position
    velocity += acceleration * time_step
    position += velocity * time_step

    # Reset event flags to False at each time step
    events["takeoff_detection"] = False
    events["apogee"] = False
    events["parachute_ejection"] = False
    events["recovery"] = False

    # Detect events
    # Takeoff detection
    if not event_occurred["takeoff_detection"] and position > 1.0:
        events["takeoff_detection"] = True
        event_occurred["takeoff_detection"] = True
        events["ascent"] = True

    # Coasting phase
    if events["ascent"] and time >= burn_time:
        events["coasting"] = True
    else:
        events["coasting"] = False

    # Apogee detection
    if not event_occurred["apogee"] and position < previous_altitude:
        events["apogee"] = True
        event_occurred["apogee"] = True
        events["ascent"] = False
        events["coasting"] = False
        events["descent"] = True
        time_of_apogee = time  # Store time of apogee
        # Print for debugging
        print(f"Apogee detected at time {time:.2f}s, altitude {position:.2f}m")

    # Parachute ejection (shortly after apogee)
    if (not event_occurred["parachute_ejection"]
        and event_occurred["apogee"]
        and time_of_apogee is not None
        and time >= (time_of_apogee + 1.0)):
        events["parachute_ejection"] = True
        event_occurred["parachute_ejection"] = True
        # Print for debugging
        print(f"Parachute ejected at time {time:.2f}s")

    # Detect landing (recovery)
    if not event_occurred["recovery"] and position <= 0.0:
        events["recovery"] = True
        event_occurred["recovery"] = True
        events["descent"] = False
        # Print for debugging
        print(f"Rocket landed at time {time:.2f}s")

    # Update orientation (same as before)
    orientation = [o + 0.05 * math.sin(0.5 * time) for o in orientation]
    orientation_q = [o + 0.05 * math.cos(0.5 * time) for o in orientation_q]

    # Update sensor readings (same as before)
    accel_bno = [0.0, 0.0, acceleration + g]
    gyro = [0.01 * math.sin(0.2 * time), 0.01 * math.cos(0.3 * time), 0.01 * math.sin(0.1 * time)]
    gravity_vector = [0.0, 0.0, -g]
    magnetometer = [30.0 + 0.1 * math.sin(0.1 * time), 0.0, 45.0 + 0.1 * math.cos(0.1 * time)]
    temperature += 0.005 * time_step
    quaternion = {
        "w": quaternion["w"],
        "x": quaternion["x"] + 0.001 * math.sin(0.2 * time),
        "y": quaternion["y"] + 0.001 * math.cos(0.2 * time),
        "z": quaternion["z"] + 0.001 * math.sin(0.2 * time)
    }
    pressure = pressure_sea_level * math.exp(-position / 8434.5)
    altitude = position
    latitude += 0.00001 * velocity * time_step
    velocity_gps = [velocity, 0.0, 0.0]

    # Format timestamp as SS:MS
    seconds = int(time)
    milliseconds = int((time - seconds) * 1000)
    formatted_timestamp = f"{seconds:02d}:{milliseconds:03d}"

    # Create telemetry entry
    telemetry_entry = {
        "timestamp": formatted_timestamp,
        "bno055_data": {
            "orientation": [round(val, 2) for val in orientation],
            "orientation_q": [round(val, 2) for val in orientation_q],
            "acceleration": [round(val, 2) for val in accel_bno],
            "gyroscope": [round(val, 2) for val in gyro],
            "gravity": [round(val, 2) for val in gravity_vector],
            "magnetometer": [round(val, 2) for val in magnetometer],
            "temperature": round(temperature, 2),
            "quaternion": {k: round(v, 4) for k, v in quaternion.items()}
        },
        "bno086_data": {
            "orientation": [round(val, 2) for val in orientation],
            "orientation_q": [round(val, 2) for val in orientation_q],
            "acceleration": [round(val, 2) for val in accel_bno],
            "gyroscope": [round(val, 2) for val in gyro],
            "gravity": [round(val, 2) for val in gravity_vector],
            "magnetometer": [round(val, 2) for val in magnetometer],
            "temperature": round(temperature, 2),
            "quaternion": {k: round(v, 4) for k, v in quaternion.items()}
        },
        "ms5607_data": {
            "pressure": int(round(pressure)),
            "temperature": round(temperature, 2),
            "altitude": round(altitude, 2)
        },
        "mpl3115a2s_data": {
            "pressure": int(round(pressure)),
            "temperature": round(temperature, 2),
            "altitude": round(altitude, 2)
        },
        "adxl375_data": {
            "acceleration": [round(val, 2) for val in accel_bno]
        },
        "gps_data": {
            "latitude": round(latitude, 6),
            "longitude": longitude,
            "altitude": round(altitude, 2),
            "velocity": [round(val, 2) for val in velocity_gps]
        },
        "events": {
            "takeoff_detection": events["takeoff_detection"],
            "ascent": events["ascent"],
            "coasting": events["coasting"],
            "apogee": events["apogee"],
            "parachute_ejection": events["parachute_ejection"],
            "descent": events["descent"],
            "recovery": events["recovery"]
        }
    }

    # Append to telemetry list
    ast_data["telemetry"].append(telemetry_entry)

    # Update previous altitude
    previous_altitude = position

# Save to AST file
with open('example.ast', 'w') as f:
    json.dump(ast_data, f, indent=2)
