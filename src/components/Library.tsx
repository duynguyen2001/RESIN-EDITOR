import React, {
    CSSProperties,
    ReactComponentElement,
    ReactElement,
    useContext,
} from "react";
import { JsonObject, JsonProperty, JsonConvert } from "json2typescript";
import {
    ForceNumberArray,
    ForceStringArray,
    StringOrStringArrayConverter,
} from "./TypeScriptUtils";
import { Handle, Position } from "reactflow";
import { JsonCustomConvert, JsonConverter } from "json2typescript";
import './Library.css';

export type RenderOptions = {
    color?: string;
    pattern?: string;
};
export type TreeRenderOptions = {
    leafNode?: string;
    parentNode?: string;
};
export abstract class NodeRenderingStrategy {
    protected eventNode: EventNode;
    static nodeOptions: TreeRenderOptions = {};

    abstract get color(): string;

    get border(): string {
        return "solid";
    }

    get shape(): string {
        if (this.eventNode.subgroupEvents.length > 0) {
            return NodeRenderingStrategy.nodeOptions.parentNode
                ? NodeRenderingStrategy.nodeOptions.parentNode
                : "diamond";
        } else {
            return NodeRenderingStrategy.nodeOptions.leafNode
                ? NodeRenderingStrategy.nodeOptions.leafNode
                : "circle";
        }
    }

    get size(): number {
        return 50;
    }
    constructor(eventNode: EventNode) {
        this.eventNode = eventNode;
    }

    render(isConnectable: boolean | undefined): ReactElement {
        return (
            <div className="hover-container">
                <span className="hover-text">
                    {this.eventNode.description}
                </span>
                {this.shape === "diamond" ? (
                    <div
                        className="diamond"
                        style={{
                            position: "relative",
                            width: `${this.size}px`,
                            height: `${this.size}px`,
                            margin: `${this.size}px auto`,
                            border: `2px ${this.border} black`,
                            borderBottomColor: "#000",
                            backgroundColor: this.color,
                            transform: "rotate(45deg)",
                        }}
                    >
                        <div
                            className="diamond__inner"
                            style={{
                                position: "absolute",
                                top: `-${this.size * 0.28}px`,
                                left: `-${this.size * 0.28}px`,
                                right: `-${this.size * 0.28}px`,
                                bottom: `-${this.size * 0.28}px`,
                                transform: "rotate(-45deg)",
                                backgroundColor: "none",
                            }}
                        >
                            <Handle
                                type="target"
                                position={Position.Top}
                                style={{ background: "#555" }}
                                onConnect={(params) =>
                                    console.log("handle onConnect", params)
                                }
                                isConnectable={isConnectable}
                            />
                            <Handle
                                type="source"
                                position={Position.Bottom}
                                style={{ background: "#555" }}
                                onConnect={(params) =>
                                    console.log("handle onConnect", params)
                                }
                                isConnectable={isConnectable}
                            />
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={this.eventNode.id + "_left"}
                                style={{ background: "#555" }}
                                onConnect={(params) =>
                                    console.log("handle onConnect", params)
                                }
                                isConnectable={isConnectable}
                            />

                            <Handle
                                type="source"
                                position={Position.Right}
                                style={{ background: "#555" }}
                                id={this.eventNode.id + "_right"}
                                onConnect={(params) =>
                                    console.log("handle onConnect", params)
                                }
                                isConnectable={isConnectable}
                            />
                        </div>
                    </div>
                ) : this.shape === "square" ? (
                    <div
                        className="square"
                        style={{
                            position: "relative",
                            width: `${this.size}px`,
                            height: `${this.size}px`,
                            margin: `${this.size}px auto`,
                            border: `2px ${this.border} black`,
                            borderBottomColor: "#000",
                            backgroundColor: this.color,
                        }}
                    >
                        <Handle
                            type="target"
                            position={Position.Top}
                            id={this.eventNode.id}
                            style={{ background: "#555" }}
                            onConnect={(params) =>
                                console.log("handle onConnect", params)
                            }
                            isConnectable={isConnectable}
                        />
                        <Handle
                            type="source"
                            position={Position.Bottom}
                            id={this.eventNode.id}
                            style={{ background: "#555" }}
                            onConnect={(params) =>
                                console.log("handle onConnect", params)
                            }
                            isConnectable={isConnectable}
                        />
                        <Handle
                            type="target"
                            id={this.eventNode.id + "_left"}
                            position={Position.Left}
                            style={{ background: "#555" }}
                            onConnect={(params) =>
                                console.log("handle onConnect", params)
                            }
                            isConnectable={isConnectable}
                        />

                        <Handle
                            type="source"
                            position={Position.Right}
                            id={this.eventNode.id + "_right"}
                            style={{ background: "#555" }}
                            onConnect={(params) =>
                                console.log("handle onConnect", params)
                            }
                            isConnectable={isConnectable}
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            position: "relative",
                            width: this.size,
                            height: this.size,
                            backgroundColor: this.color || "white",
                            border: `3px ${this.border} black`,
                            borderRadius: "50%",
                        }}
                    >
                        <Handle
                            type="target"
                            position={Position.Top}
                            id={this.eventNode.id}
                            style={{ background: "#555" }}
                            onConnect={(params) =>
                                console.log("handle onConnect", params)
                            }
                            isConnectable={isConnectable}
                        />
                        <Handle
                            type="source"
                            position={Position.Bottom}
                            id={this.eventNode.id}
                            style={{ background: "#555" }}
                            onConnect={(params) =>
                                console.log("handle onConnect", params)
                            }
                            isConnectable={isConnectable}
                        />
                        <Handle
                            type="target"
                            id={this.eventNode.id + "_left"}
                            position={Position.Left}
                            style={{ background: "#555" }}
                            onConnect={(params) =>
                                console.log("handle onConnect", params)
                            }
                            isConnectable={isConnectable}
                        />

                        <Handle
                            type="source"
                            position={Position.Right}
                            id={this.eventNode.id + "_right"}
                            style={{ background: "#555" }}
                            onConnect={(params) =>
                                console.log("handle onConnect", params)
                            }
                            isConnectable={isConnectable}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export class PredictedNodeStrategy extends NodeRenderingStrategy {
    predictionProvenance: string[];
    confidence: number[];
    static options: RenderOptions = {};

    constructor(
        eventNode: EventNode,
        predictionProvenance: string[],
        confidence: number[]
    ) {
        super(eventNode);
        this.predictionProvenance = predictionProvenance;
        this.confidence = confidence;
    }

    get color(): string {
        return PredictedNodeStrategy.options.color
            ? PredictedNodeStrategy.options.color
            : "yellow";
    }
}

export class DetectedNodeStrategy extends NodeRenderingStrategy {
    provenance: string[];
    confidence: number[];
    static options: RenderOptions = {};

    constructor(
        eventNode: EventNode,
        provenance: string[],
        confidence: number[]
    ) {
        super(eventNode);
        this.provenance = provenance;
        this.confidence = confidence;
    }

    get color(): string {
        return DetectedNodeStrategy.options.color
            ? DetectedNodeStrategy.options.color
            : "red";
    }
    get border(): string {
        return this.eventNode.optional ? "dotted" : "solid";
    }
}

export class SourceOnlyNodeStrategy extends NodeRenderingStrategy {
    provenance: string | string[];
    confidence: number | number[];
    static options: RenderOptions = {};

    constructor(
        eventNode: EventNode,
        provenance: string | string[],
        confidence: number | number[]
    ) {
        super(eventNode);
        this.provenance = provenance;
        this.confidence = confidence;
    }

    get color(): string {
        return SourceOnlyNodeStrategy.options.color
            ? SourceOnlyNodeStrategy.options.color
            : "blue";
    }
}

@JsonObject("Value")
export class Value {
    @JsonProperty("@id", String)
    id: string;

    @JsonProperty("confidence", ForceNumberArray, true)
    confidence: number[];

    @JsonProperty("provenance", ForceStringArray, true)
    provenance: string[];

    @JsonProperty("ta2entity", String, true)
    ta2entity: string;

    constructor(
        id: string,
        confidence: number[],
        provenance: string[],
        ta2entity: string
    ) {
        this.id = id;
        this.confidence = confidence;
        this.provenance = provenance;
        this.ta2entity = ta2entity;
    }
}

@JsonConverter
export class ValueOrValueArrayConverter
    implements JsonCustomConvert<Value | Value[]>
{
    serialize(data: Value | Value[]): any {
        return data;
    }

    deserialize(json: any): Value | Value[] {
        if (Array.isArray(json)) {
            return json.map(
                (item) =>
                    new Value(
                        item["@id"],
                        item.confidence,
                        item.provenance,
                        item.ta2entity
                    )
            );
        } else {
            return new Value(
                json["@id"],
                json.confidence,
                json.provenance,
                json.ta2entity
            );
        }
    }
}
@JsonObject("Participant")
export class Participant {
    @JsonProperty("@id", String)
    id: string;

    @JsonProperty("entity", String, true)
    entity: string;

    @JsonProperty("roleName", String, true)
    roleName: string;

    @JsonProperty("values", ValueOrValueArrayConverter, true)
    values: Value | Value[] = [];

    constructor(id: string, entity: string, roleName: string, values: Value) {
        this.id = id;
        this.entity = entity;
        this.roleName = roleName;
        this.values = values;
    }
    render(
        options: RenderOptions = {},
        isConnectable: boolean | undefined
    ): ReactElement {
        return (
            <div
                style={{
                    width: 50,
                    height: 50,
                    backgroundColor: "green",
                }}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    id={this.id}
                    style={{ background: "#555" }}
                    onConnect={(params) =>
                        console.log("handle onConnect", params)
                    }
                    isConnectable={isConnectable}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id={this.id}
                    style={{ background: "#555" }}
                    onConnect={(params) =>
                        console.log("handle onConnect", params)
                    }
                    isConnectable={isConnectable}
                />
                <text>ID: {this.id}</text>
                <text>Entity: {this.entity}</text>
                <text>RoleName: {this.roleName}</text>
            </div>
        );
    }
}
export enum EventNodeType {
    Predicted,
    SourceOnly,
    Detected,
}

@JsonObject("EventNode")
export class EventNode {
    @JsonProperty("@id", String, true)
    id: string;

    @JsonProperty("ta1ref", String, true)
    ta1ref: string;

    @JsonProperty("name", String, true)
    name: string;

    @JsonProperty("description", String, true)
    description: String;

    @JsonProperty("parent", String, true)
    parent?: String;

    @JsonProperty("isTopLevel", Boolean, true)
    isTopLevel?: Boolean;

    @JsonProperty("subgroup_events", [String], true)
    subgroupEvents: string[];

    @JsonProperty("children_gate", String, true)
    childrenGate: string;

    @JsonProperty("outlinks", [String], true)
    outlinks: string[];

    @JsonProperty("predictionProvenance", ForceStringArray, true)
    predictionProvenance?: string[];

    @JsonProperty("confidence", ForceNumberArray, true)
    confidence?: number[];

    @JsonProperty("wd_node", StringOrStringArrayConverter, true)
    wdNode?: string | string[];

    @JsonProperty("wd_label", String, true)
    wdLabel?: string;

    @JsonProperty("wd_description", String, true)
    wdDescription?: string;

    @JsonProperty("provenance", ForceStringArray, true)
    provenance?: string[];

    @JsonProperty("participants", [Participant], true)
    participants?: Participant[];

    @JsonProperty("ta2wd_node", String, true)
    ta2wdNode?: string;

    @JsonProperty("ta2wd_label", String, true)
    ta2wdLabel?: string;

    @JsonProperty("ta2wd_description", String, true)
    ta2wdDescription?: string;

    @JsonProperty("optional", Boolean, true)
    optional?: boolean;

    isParticipantOpen: boolean = true;

    get type(): EventNodeType {
        if (this.predictionProvenance !== undefined) {
            return EventNodeType.Predicted;
        } else if (this.ta1ref === "none") {
            return EventNodeType.SourceOnly;
        }
        return EventNodeType.Detected;
    }

    constructor(
        id: string,
        ta1ref: string = "none",
        name?: string,
        description?: string,
        parent?: string,
        isTopLevel?: boolean,
        subgroupEvents?: string[],
        childrenGate?: string,
        outlinks?: string[],
        predictionProvenance?: string[],
        confidence?: number[],
        wdNode?: string,
        wdLabel?: string,
        wdDescription?: string,
        provenance?: string[],
        participants?: Participant[],
        ta2wdNode?: string,
        ta2wdLabel?: string,
        ta2wdDescription?: string,
        optional?: boolean
    ) {
        this.id = id;
        this.ta1ref = ta1ref || "none";
        this.name = name || id;
        this.description = description || "";
        this.parent = parent || "";
        this.isTopLevel = isTopLevel || false;
        this.subgroupEvents = subgroupEvents || [];
        this.childrenGate = childrenGate || "";
        this.outlinks = outlinks || [];
        this.predictionProvenance = predictionProvenance;
        this.confidence = confidence || [];
        this.wdNode = wdNode || "";
        this.wdLabel = wdLabel || "";
        this.wdDescription = wdDescription || "";
        this.provenance = provenance || [];
        this.participants = participants || [];
        this.ta2wdNode = ta2wdNode || "";
        this.ta2wdLabel = ta2wdLabel || "";
        this.ta2wdDescription = ta2wdDescription || "";
        this.optional = optional || false;
    }

    get renderStrategy(): NodeRenderingStrategy {
        if (this.type === EventNodeType.Predicted) {
            return new PredictedNodeStrategy(
                this,
                this.predictionProvenance as string[],
                this.confidence as number[]
            );
        } else if (this.type === EventNodeType.SourceOnly) {
            return new SourceOnlyNodeStrategy(
                this,
                this.provenance as string[],
                this.confidence as number[]
            );
        } else {
            return new DetectedNodeStrategy(
                this,
                this.provenance as string[],
                this.confidence as number[]
            );
        }
    }

    render(
        options: RenderOptions,
        isConnectable: boolean | undefined
    ): ReactElement {
        // console.log("Rendering node: " + this.id);
        return (
            <div>
                {this.renderStrategy.render(isConnectable)}
                <div className="text-lg font-bold">{this.name}</div>
            </div>
        );
    }
}

// Define interfaces for the rendering strategy pattern
interface ProvenanceRenderStrategy {
    render(): void;
}

class TextRenderStrategy implements ProvenanceRenderStrategy {
    render(): void {
        console.log("Rendering text/plain");
    }
}

class ImageRenderStrategy implements ProvenanceRenderStrategy {
    render(): void {
        console.log("Rendering image/jpg");
    }
}

// Define ProvenanceEntity with json2typescript decorators
@JsonObject("ProvenanceEntity")
abstract class ProvenanceEntity {
    @JsonProperty("provenanceID", String)
    id: string = undefined!;

    @JsonProperty("childID", String)
    childID: string = undefined!;

    @JsonProperty("parentIDs", ForceStringArray)
    parentIDs: string[] = undefined!;

    @JsonProperty("mediaType", String)
    mediaType: string = undefined!;

    protected renderStrategy: ProvenanceRenderStrategy | undefined;

    public abstract getRenderStrategy(): ProvenanceRenderStrategy;

    public render(): void {
        this.getRenderStrategy().render();
    }
}

// Define TextProvenance with json2typescript decorators
@JsonObject("TextProvenance")
class TextProvenance extends ProvenanceEntity {
    @JsonProperty("offset", Number)
    offset: number = 0;

    @JsonProperty("length", Number)
    length: number = 0;

    @JsonProperty("sourceURL", ForceStringArray)
    sourceURL: string[] = [];

    public getRenderStrategy(): ProvenanceRenderStrategy {
        if (!this.renderStrategy) {
            this.renderStrategy = new TextRenderStrategy();
        }
        return this.renderStrategy;
    }
}

// Define ImageProvenance with json2typescript decorators
@JsonObject("ImageProvenance")
class ImageProvenance extends ProvenanceEntity {
    @JsonProperty("boundingBox", [Number])
    boundingBox: number[] = [];

    @JsonProperty("sourceURL", ForceStringArray)
    sourceURL: string[] = [];

    public getRenderStrategy(): ProvenanceRenderStrategy {
        if (!this.renderStrategy) {
            this.renderStrategy = new ImageRenderStrategy();
        }
        return this.renderStrategy;
    }
}
interface ProvenanceData {
    mediaType: string;
    [key: string]: any;
}
export function createProvenanceEntity(
    jsonData: ProvenanceData
): ProvenanceEntity {
    const jsonConvert = new JsonConvert();

    if (jsonData.mediaType === "text/plain") {
        return jsonConvert.deserializeObject(jsonData, TextProvenance);
    } else if (jsonData.mediaType === "image/jpg") {
        return jsonConvert.deserializeObject(jsonData, ImageProvenance);
    } else {
        throw new Error(`Unsupported mediaType: ${jsonData.mediaType}`);
    }
}

@JsonObject("Entity")
export class Entity {
    @JsonProperty("@id", String)
    id: string = undefined!;
    @JsonProperty("name", String)
    name: string = undefined!;

    @JsonProperty("wd_node", StringOrStringArrayConverter, true)
    wd_node?: string | [string];

    @JsonProperty("wd_label", StringOrStringArrayConverter, true)
    wd_label?: string | [string];

    @JsonProperty("wd_description", StringOrStringArrayConverter, true)
    wd_description?: string | [string];

    @JsonProperty("ta2wd_node", StringOrStringArrayConverter, true)
    ta2wd_node?: string | [string];

    @JsonProperty("ta2wd_label", String, true)
    ta2wd_label?: string | [string];

    @JsonProperty("ta2wd_description", StringOrStringArrayConverter, true)
    ta2wd_description?: string | [string];

    constructor(
        id: string,
        wd_node: string = undefined!,
        wd_label: string = undefined!,
        wd_description: string = undefined!,
        ta2wd_node: string = undefined!,
        ta2wd_label: string = undefined!,
        ta2wd_description: string = undefined!
    ) {
        this.id = id;
        this.wd_node = wd_node;
        this.wd_label = wd_label;
        this.wd_description = wd_description;
        this.ta2wd_node = ta2wd_node;
        this.ta2wd_label = ta2wd_label;
        this.ta2wd_description = ta2wd_description;
    }
}
