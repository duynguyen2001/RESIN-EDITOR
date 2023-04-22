
import { JsonCustomConvert, JsonConverter } from "json2typescript";
@JsonConverter
export class StringOrStringArrayConverter implements JsonCustomConvert<string | string[]> {
  serialize(data: string | string[]): any {
    return data;
  }

  deserialize(json: any): string | string[] {
    if (Array.isArray(json)) {
      return json.map((item) => String(item));
    } else {
      return String(json);
    }
  }
}
@JsonConverter
export class NumberOrNumberArrayConverter implements JsonCustomConvert<number | number[]> {
  serialize(data: number | number[]): any {
    return data;
  }

  deserialize(json: any): number | number[] {
    if (Array.isArray(json)) {
      return json.map((item) => Number(item));
    } else {
      return Number(json);
    }
  }
}


@JsonConverter
export class ForceNumberArray implements JsonCustomConvert<number | number[]> {
  serialize(data: number[]): any {
    return data.length > 1 ? data : data.length > 0? data[0]: undefined;
  }

  deserialize(json: any): number[] {
    if (Array.isArray(json)) {
      return json.map((item) => Number(item));
    } else {
      return [Number(json)];
    }
  }
}
@JsonConverter
export class ForceStringArray implements JsonCustomConvert<string | string[]> {
  serialize(data: string[]): any {
    return data.length > 1 ? data : data.length > 0? data[0]: undefined;
  }

  deserialize(json: any): string[] {
    if (Array.isArray(json)) {
      return json.map((item) => String(item));
    } else {
      return [String(json)];
    }
  }
}