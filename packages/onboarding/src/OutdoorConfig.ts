/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
import Long = require("long");

export const protobufPackage = "";

export enum heightType {
  NONE = 0,
  AGL = 1,
  MSL = 2,
  UNRECOGNIZED = -1,
}

export function heightTypeFromJSON(object: any): heightType {
  switch (object) {
    case 0:
    case "NONE":
      return heightType.NONE;
    case 1:
    case "AGL":
      return heightType.AGL;
    case 2:
    case "MSL":
      return heightType.MSL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return heightType.UNRECOGNIZED;
  }
}

export function heightTypeToJSON(object: heightType): string {
  switch (object) {
    case heightType.NONE:
      return "NONE";
    case heightType.AGL:
      return "AGL";
    case heightType.MSL:
      return "MSL";
    case heightType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Message {
  walletPubKey: Uint8Array;
  hmhPubKey: Uint8Array;
  cluster: string;
  lat: number;
  long: number;
  antenna: number;
  height: number;
  heightType: heightType;
  azimuth: number;
  mechanicalDownTilt: number;
  electricalDownTilt: number;
  timestamp: number;
  signature: Uint8Array;
}

function createBaseMessage(): Message {
  return {
    walletPubKey: new Uint8Array(0),
    hmhPubKey: new Uint8Array(0),
    cluster: "",
    lat: 0,
    long: 0,
    antenna: 0,
    height: 0,
    heightType: 0,
    azimuth: 0,
    mechanicalDownTilt: 0,
    electricalDownTilt: 0,
    timestamp: 0,
    signature: new Uint8Array(0),
  };
}

export const Message = {
  encode(message: Message, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.walletPubKey.length !== 0) {
      writer.uint32(10).bytes(message.walletPubKey);
    }
    if (message.hmhPubKey.length !== 0) {
      writer.uint32(18).bytes(message.hmhPubKey);
    }
    if (message.cluster !== "") {
      writer.uint32(26).string(message.cluster);
    }
    if (message.lat !== 0) {
      writer.uint32(33).double(message.lat);
    }
    if (message.long !== 0) {
      writer.uint32(41).double(message.long);
    }
    if (message.antenna !== 0) {
      writer.uint32(48).uint32(message.antenna);
    }
    if (message.height !== 0) {
      writer.uint32(57).double(message.height);
    }
    if (message.heightType !== 0) {
      writer.uint32(64).int32(message.heightType);
    }
    if (message.azimuth !== 0) {
      writer.uint32(73).double(message.azimuth);
    }
    if (message.mechanicalDownTilt !== 0) {
      writer.uint32(81).double(message.mechanicalDownTilt);
    }
    if (message.electricalDownTilt !== 0) {
      writer.uint32(89).double(message.electricalDownTilt);
    }
    if (message.timestamp !== 0) {
      writer.uint32(96).uint64(message.timestamp);
    }
    if (message.signature.length !== 0) {
      writer.uint32(106).bytes(message.signature);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Message {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.walletPubKey = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.hmhPubKey = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.cluster = reader.string();
          continue;
        case 4:
          if (tag !== 33) {
            break;
          }

          message.lat = reader.double();
          continue;
        case 5:
          if (tag !== 41) {
            break;
          }

          message.long = reader.double();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.antenna = reader.uint32();
          continue;
        case 7:
          if (tag !== 57) {
            break;
          }

          message.height = reader.double();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.heightType = reader.int32() as any;
          continue;
        case 9:
          if (tag !== 73) {
            break;
          }

          message.azimuth = reader.double();
          continue;
        case 10:
          if (tag !== 81) {
            break;
          }

          message.mechanicalDownTilt = reader.double();
          continue;
        case 11:
          if (tag !== 89) {
            break;
          }

          message.electricalDownTilt = reader.double();
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.timestamp = longToNumber(reader.uint64() as Long);
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.signature = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Message {
    return {
      walletPubKey: isSet(object.walletPubKey) ? bytesFromBase64(object.walletPubKey) : new Uint8Array(0),
      hmhPubKey: isSet(object.hmhPubKey) ? bytesFromBase64(object.hmhPubKey) : new Uint8Array(0),
      cluster: isSet(object.cluster) ? globalThis.String(object.cluster) : "",
      lat: isSet(object.lat) ? globalThis.Number(object.lat) : 0,
      long: isSet(object.long) ? globalThis.Number(object.long) : 0,
      antenna: isSet(object.antenna) ? globalThis.Number(object.antenna) : 0,
      height: isSet(object.height) ? globalThis.Number(object.height) : 0,
      heightType: isSet(object.heightType) ? heightTypeFromJSON(object.heightType) : 0,
      azimuth: isSet(object.azimuth) ? globalThis.Number(object.azimuth) : 0,
      mechanicalDownTilt: isSet(object.mechanicalDownTilt) ? globalThis.Number(object.mechanicalDownTilt) : 0,
      electricalDownTilt: isSet(object.electricalDownTilt) ? globalThis.Number(object.electricalDownTilt) : 0,
      timestamp: isSet(object.timestamp) ? globalThis.Number(object.timestamp) : 0,
      signature: isSet(object.signature) ? bytesFromBase64(object.signature) : new Uint8Array(0),
    };
  },

  toJSON(message: Message): unknown {
    const obj: any = {};
    if (message.walletPubKey.length !== 0) {
      obj.walletPubKey = base64FromBytes(message.walletPubKey);
    }
    if (message.hmhPubKey.length !== 0) {
      obj.hmhPubKey = base64FromBytes(message.hmhPubKey);
    }
    if (message.cluster !== "") {
      obj.cluster = message.cluster;
    }
    if (message.lat !== 0) {
      obj.lat = message.lat;
    }
    if (message.long !== 0) {
      obj.long = message.long;
    }
    if (message.antenna !== 0) {
      obj.antenna = Math.round(message.antenna);
    }
    if (message.height !== 0) {
      obj.height = message.height;
    }
    if (message.heightType !== 0) {
      obj.heightType = heightTypeToJSON(message.heightType);
    }
    if (message.azimuth !== 0) {
      obj.azimuth = message.azimuth;
    }
    if (message.mechanicalDownTilt !== 0) {
      obj.mechanicalDownTilt = message.mechanicalDownTilt;
    }
    if (message.electricalDownTilt !== 0) {
      obj.electricalDownTilt = message.electricalDownTilt;
    }
    if (message.timestamp !== 0) {
      obj.timestamp = Math.round(message.timestamp);
    }
    if (message.signature.length !== 0) {
      obj.signature = base64FromBytes(message.signature);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Message>, I>>(base?: I): Message {
    return Message.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Message>, I>>(object: I): Message {
    const message = createBaseMessage();
    message.walletPubKey = object.walletPubKey ?? new Uint8Array(0);
    message.hmhPubKey = object.hmhPubKey ?? new Uint8Array(0);
    message.cluster = object.cluster ?? "";
    message.lat = object.lat ?? 0;
    message.long = object.long ?? 0;
    message.antenna = object.antenna ?? 0;
    message.height = object.height ?? 0;
    message.heightType = object.heightType ?? 0;
    message.azimuth = object.azimuth ?? 0;
    message.mechanicalDownTilt = object.mechanicalDownTilt ?? 0;
    message.electricalDownTilt = object.electricalDownTilt ?? 0;
    message.timestamp = object.timestamp ?? 0;
    message.signature = object.signature ?? new Uint8Array(0);
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
