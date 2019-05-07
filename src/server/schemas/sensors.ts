
export type Sensors = MqttSensor | TemplateSensor | OtherSensor;

/**
 * @TJS-additionalProperties true
 */
export interface OtherSensor {
    /**
     * @TJS-pattern (^(?!.*(mqtt|template)).*)$
     */
    platform: string;
}

export interface MqttSensor {
    platform: "mqtt";
    state_topic: string;
    name?: string;
    qos?: number;
    unit_of_measurement?: string;
    icon?: string;
    expire_after?: number;
    value_template?: string;
    force_update?: boolean;
    availability_topic?: string;
    payload_available?: string;
    payload_not_available?: string;
    json_attributes_topic?: string;
    json_attributes?: string | string[];
    unique_id?: string;
    device_class?: string;
    device?: any;
}
export interface TemplateSensor {
    platform: "template";
    sensors: {
        [key: string]: TemplateSensorEntry;
    };
}

export interface TemplateSensorEntry {
    friendly_name?: string;
    friendly_name_template?: string;
    entity_id?: string | string[];
    unit_of_measurement?: string;
    value_template?: string;
    icon_template?: string;
    entity_picture_template?: string;
    device_class?: string;
}