/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// tslint:disable
import hljs from 'highlight.js';
import {html, LitElement, render} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {Marked} from 'marked';
import {markedHighlight} from 'marked-highlight';
import Typed from 'typed.js';

import {MapParams} from './mcp_maps_server';

/** Markdown formatting function with syntax hilighting */
export const marked = new Marked(
  markedHighlight({
    async: true,
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, {language}).value;
    },
  }),
);

function base64ToUint8Array(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Uint8Array(bytes.buffer);
}

export const ICON_BUSY = html`<svg
  class="rotating"
  xmlns="http://www.w3.org/2000/svg"
  height="24px"
  viewBox="0 -960 960 960"
  width="24px"
  fill="currentColor">
  <path
    d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z" />
</svg>`;

const ICON_SPARK = html`
<svg class="icon-spark" xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
  <path d="M14.4724 6.97261C13.5123 6.97261 12.6253 6.79081 11.7813 6.43241C10.9368 6.06222 10.1919 5.55772 9.56731 4.9331C8.94269 4.30848 8.4382 3.56357 8.06808 2.71914C7.70954 1.87487 7.52781 0.987769 7.52781 0.0275806C7.52781 0.0123347 7.51548 0 7.50023 0C7.48498 0 7.47265 0.0123347 7.47265 0.0275806C7.47265 0.987616 7.28503 1.87456 6.91491 2.71914C6.55629 3.56357 6.05777 4.30848 5.43315 4.9331C4.80868 5.55772 4.0637 6.06214 3.21936 6.43226C2.37501 6.79081 1.48776 6.97269 0.52758 6.97269C0.512335 6.97269 0.5 6.98502 0.5 7.00027C0.5 7.01551 0.512335 7.02785 0.52758 7.02785C1.48753 7.02785 2.37478 7.21547 3.21936 7.58567C4.06386 7.94444 4.80876 8.44296 5.43315 9.06736C6.05777 9.69214 6.55637 10.437 6.91499 11.2816C7.28503 12.1257 7.47265 13.0124 7.47265 13.9724C7.47265 13.9877 7.48498 14 7.50023 14C7.51548 14 7.52781 13.9877 7.52781 13.9724C7.52781 13.0122 7.70954 12.1255 8.068 11.2816C8.4382 10.437 8.94261 9.69198 9.56731 9.06736C10.1917 8.44281 10.9365 7.94429 11.7813 7.58559C12.6256 7.21555 13.5125 7.02785 14.4724 7.02785C14.4877 7.02785 14.5 7.01551 14.5 7.00027C14.5 6.98502 14.4877 6.97261 14.4724 6.97261Z" fill="url(#paint0_linear_17_4172)"/>
  <defs>
    <linearGradient id="paint0_linear_17_4172" x1="4.85713" y1="9.04942" x2="11.1902" y2="3.70994" gradientUnits="userSpaceOnUse">
      <stop stop-color="#217BFE"/>
      <stop offset="0.27" stop-color="#078EFB"/>
      <stop offset="0.776981" stop-color="#A190FF"/>
      <stop offset="1" stop-color="#BD99FE"/>
    </linearGradient>
  </defs>
</svg>
`;

const ICON_START = html`
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="28" height="28" rx="14" fill="#F8F9FA"/>
  <path d="M7.125 18.75V10.25H8.4V18.75H7.125ZM16.475 17.9L15.5719 16.9969L17.4313 15.1375H9.675V13.8625H17.4313L15.5719 12.0031L16.475 11.1L19.875 14.5L16.475 17.9Z" fill="#0C67DF"/>
</svg>
`;

const ICON_BRUSH_SPARK = html`
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14Z" fill="#F8F9FA"/>
  <path d="M9.37396 20.5385C8.84271 20.5385 8.34097 20.4205 7.86875 20.1844C7.40833 19.9365 7.01875 19.6059 6.7 19.1927C7.06597 19.1691 7.37882 19.0333 7.63854 18.7854C7.89826 18.5375 8.02813 18.2306 8.02813 17.8646C8.02813 17.2979 8.22292 16.8257 8.6125 16.4479C9.00208 16.0583 9.48021 15.8635 10.0469 15.8635C10.6017 15.8635 11.0681 16.0583 11.4458 16.4479C11.8354 16.8375 12.0302 17.3097 12.0302 17.8646C12.0302 18.6083 11.7705 19.2399 11.251 19.7594C10.7434 20.2788 10.1177 20.5385 9.37396 20.5385ZM9.37396 19.3521C9.78715 19.3521 10.1354 19.2104 10.4188 18.9271C10.7139 18.6319 10.8615 18.2778 10.8615 17.8646C10.8615 17.6403 10.7788 17.4514 10.6135 17.2979C10.4601 17.1326 10.2712 17.05 10.0469 17.05C9.82257 17.05 9.62778 17.1326 9.4625 17.2979C9.30903 17.4514 9.23229 17.6403 9.23229 17.8646C9.23229 18.1243 9.20278 18.3781 9.14375 18.626C9.08472 18.8622 8.97257 19.0747 8.80729 19.2635C8.90174 19.2872 8.99618 19.3108 9.09063 19.3344C9.18507 19.3462 9.27951 19.3521 9.37396 19.3521ZM13.5531 16.3417L11.7469 14.5354L17.3958 8.88646C17.5611 8.72118 17.7618 8.63854 17.9979 8.63854C18.234 8.63854 18.4347 8.72118 18.6 8.88646L19.2021 9.48854C19.3674 9.65382 19.45 9.85451 19.45 10.0906C19.45 10.3149 19.3674 10.5097 19.2021 10.675L13.5531 16.3417ZM8.825 12.8C8.81319 12.8 8.76597 12.7646 8.68333 12.6937C8.51806 12.0208 8.1875 11.4424 7.69167 10.9583C7.20764 10.4625 6.62917 10.1319 5.95625 9.96667C5.93264 9.95486 5.89722 9.90764 5.85 9.825C5.85 9.80139 5.88542 9.75417 5.95625 9.68333C6.62917 9.51805 7.20764 9.1934 7.69167 8.70937C8.1875 8.21354 8.51806 7.62917 8.68333 6.95625C8.69514 6.93264 8.74236 6.89722 8.825 6.85C8.84861 6.85 8.89583 6.88542 8.96667 6.95625C9.14375 7.62917 9.47431 8.20764 9.95833 8.69167C10.4424 9.17569 11.0208 9.50625 11.6938 9.68333C11.7174 9.68333 11.7528 9.73056 11.8 9.825C11.8 9.8368 11.7646 9.88403 11.6938 9.96667C11.0208 10.1319 10.4365 10.4625 9.94063 10.9583C9.4566 11.4424 9.13194 12.0208 8.96667 12.6937C8.96667 12.7174 8.91944 12.7528 8.825 12.8Z" fill="#0C67DF"/>
</svg>
`;

const ICON_DOWNLOAD = html`
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14Z" fill="#F8F9FA"/>
  <path d="M13.5 17.05L10.1 13.65L11.0031 12.7469L12.8625 14.6062V8.55H14.1375V14.6062L15.9969 12.7469L16.9 13.65L13.5 17.05ZM9.675 19.6C9.32083 19.6 9.01979 19.476 8.77188 19.2281C8.52396 18.9802 8.4 18.6792 8.4 18.325V17.05H9.675V18.325H17.325V17.05H18.6V18.325C18.6 18.6792 18.476 18.9802 18.2281 19.2281C17.9802 19.476 17.6792 19.6 17.325 19.6H9.675Z" fill="#0C67DF"/>
</svg>
`;

export const ICON_COPY = html`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>`;
export const ICON_CHECK = html`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>`;
export const ICON_DOWNLOAD_SIMPLE = html`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-320 280-520l56-58 104 104v-320h80v320l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>`;

const ICON_ADD_PHOTO = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="24px"
  viewBox="0 -960 960 960"
  width="24px"
  fill="currentColor">
  <path d="M480-480ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h320v80H200v560h560v-320h80v320q0 33-23.5 56.5T760-120H200Zm40-160h480L570-480 450-320l-90-120-120 160Zm440-320v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/>
</svg>`;

const ICON_INFO = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="24px"
  viewBox="0 -960 960 960"
  width="24px"
  fill="currentColor">
  <path
    d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
</svg>`;

const LOCAL_STORAGE_GET_STARTED_KEY =
  'ai_studio_maps_styling_sandbox_get_started_dialog';

/**
 * Chat state enum to manage the current state of the chat interface.
 */
export enum ChatState {
  IDLE,
  GENERATING,
  THINKING,
  EXECUTING,
}

/**
 * Chat role enum to manage the current role of the message.
 */
export enum ChatRole {
  USER,
  ASSISTANT,
  SYSTEM,
}

interface Viewport {
  lat: number;
  lng: number;
  zoom: number;
}

const DEFAULT_VIEWPORT = {
  lat: 47.65,
  lng: -122,
  zoom: 8,
};

const PLACEHOLDERS = [
  'Start typing... or paste an image',
  'Create a pink and blue style',
  'Make the water change from yellow to orange as I zoom in',
  'Generate a style from this image',
];

const PLACEHOLDER_CHANGE_TIME_MS = 5000;

/**
 * Playground component for p5js.
 */
@customElement('gdm-playground')
export class Playground extends LitElement {
  @query('#anchor') anchor?: HTMLDivElement;
  @query('#inputArea') inputArea?: HTMLDivElement;
  @query('#messageInput') messageInput?: HTMLInputElement;
  @query('#imageUpload') imageUpload?: HTMLInputElement;

  @state() chatState = ChatState.IDLE;
  @state() isRunning = true;
  @state() isAboutDialogVisible = false;
  private focusedElementBeforeDialog: HTMLElement | null = null;
  @state() inputMessage = '';
  @state() placeholderQuery = '';
  @state() messages: HTMLElement[] = [];
  @state()
  droppedImage: {data: string; mimeType: string; dataUrl: string} | null =
    null;
  private readonly map: HTMLDivElement = document.createElement('div');
  private readonly initMap: HTMLDivElement = document.createElement('div');

  sendMessageHandler?: (
    input: string,
    role: string,
    image?: {mimeType: string; data: string},
  ) => Promise<void>;

  viewport: Viewport = DEFAULT_VIEWPORT;

  // Google Map
  googleMap: any;
  geocoder: any;
  directionsService: any;
  directionsRenderer: any;
  placesService: any;
  infoWindow: any;
  markers: any[] = [];
  styleTableBytes?: Uint8Array;
  placeholderIndex = 0;

  resolveConfigVersion: (configVersion: string) => void;
  configVersion: Promise<string> = new Promise(res => {
    this.resolveConfigVersion = res;
  });

  typed?: Typed;

  // Will be populated by the agent if necessary
  @state() jsonStyle: string;

  constructor() {
    super();
    this.map.setAttribute('id', 'map');
    this.initMap.setAttribute('id', 'initMap');
  }

  firstUpdated() {
    this.postRenderInit();
  }

  private changePlaceholder(query: string) {
    if (
      document.activeElement.id === 'messageInput' ||
      this.inputMessage !== ''
    ) {
      return;
    }
    this.placeholderQuery = query;
  }

  /** Code that must run after the DOM structure has been created */
  postRenderInit() {
    this.defineConfigVersion();
    this.createMap();
    this.geocoder = new (window as any).google.maps.Geocoder();
    this.directionsService =
      new (window as any).google.maps.DirectionsService();

    if (this.inputArea) {
      this.inputArea.addEventListener('dragover', this.handleDragOver.bind(this));
      this.inputArea.addEventListener(
        'dragleave',
        this.handleDragLeave.bind(this),
      );
      this.inputArea.addEventListener('drop', this.handleDrop.bind(this));
    }
    this.messageInput?.addEventListener('paste', this.handlePaste.bind(this));

    this.typed = new Typed('#messageInput', {
      strings: [...PLACEHOLDERS],
      startDelay: 1000,
      typeSpeed: 50,
      backSpeed: 20,
      backDelay: 2000,
      loop: true,
      attr: 'placeholder',
      showCursor: false,
      onStop: () => {
        setTimeout(() => {
          (document.querySelector('#messageInput') as HTMLTextAreaElement).placeholder = 'What do you want your map to look like?';
        }, 100);
      }
    });
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.inputArea?.classList.add('dragover');
  }

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.inputArea?.classList.remove('dragover');
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.inputArea?.classList.remove('dragover');
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }

  private handlePaste(e: ClipboardEvent) {
    if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
      this.handleFile(e.clipboardData.files[0]);
    }
  }

  private handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      // Reset file input to allow selecting the same file again
      target.value = '';

      const tenMB = 10 * 1024 * 1024;
      if (file.size > tenMB) {
        this.addMessage('error', 'Image size must be less than 10MB.');
        this.scrollToTheEnd();
        return;
      }

      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        this.handleFile(file);
      } else {
        this.addMessage('error', 'Please select a PNG or JPG image.');
        this.scrollToTheEnd();
      }
    }
  }

  private handleFile(file: File) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
        this.droppedImage = {
          data: base64Data,
          mimeType: file.type,
          dataUrl: dataUrl,
        };
      };
      reader.readAsDataURL(file);
    }
  }

  /** Disable shadow DOM */
  createRenderRoot() {
    return this;
  }

  setChatState(state: ChatState) {
    this.chatState = state;
    if (state !== ChatState.EXECUTING) {
      for (const el of document.querySelectorAll('.executing')) {
        el.classList.remove('executing');
      }
    }
  }

  private clearMarkers() {
    for (const marker of this.markers) {
      marker.setMap(null);
    }
    this.markers = [];
  }

  private clearMapOverlays() {
    this.clearMarkers();
    if (this.directionsRenderer) {
      this.directionsRenderer.setDirections({routes: []});
    }
  }

  /** Defined here to ensure that it's up to date when requesting a style table. */
  defineConfigVersion() {
    const api = (window as any).google.maps;
    const mapElement = document.getElementById('initMap');
    if (!mapElement) return;

    const mapOptions = {
      renderingType: 'VECTOR',
      center: {lat: this.viewport.lat, lng: this.viewport.lng},
      zoom: this.viewport.zoom,
    };

    const map = new api.Map(mapElement, mapOptions);

    api.event.addListenerOnce(map, 'tilesloaded', () => {
      const configVersion = api.styleEditor?.getConfigVersion(map);
      mapElement.parentElement!.removeChild(mapElement);
      this.resolveConfigVersion(configVersion);
    });
  }

  renderMapQuery(params: MapParams) {
    if (params.jsonStyle) {
      this.jsonStyle = params.jsonStyle;
      return;
    }

    if (params.base64StyleTable) {
      this.styleTableBytes = base64ToUint8Array(params.base64StyleTable);
      this.createMap();
      return;
    }

    if (!this.googleMap) {
      this.createMap();
    }

    if (params.location) {
      this.handleLocationQuery(params.location);
      return;
    }

    if (params.origin && params.destination) {
      this.handleDirections(params.origin, params.destination);
      return;
    }

    if (params.search) {
      this.handleSearch(params.search);
      return;
    }
  }

  private createMap() {
    this.clearMapOverlays();

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    let colorScheme = 'LIGHT';

    if (this.jsonStyle) {
      try {
        const style = JSON.parse(this.jsonStyle);
        if (style.variant === 'dark') {
          colorScheme = 'DARK';
        }
      } catch (e) {
        // swallow the error;
      }
    }

    const mapOptions: any = {
      center: {lat: this.viewport.lat, lng: this.viewport.lng},
      fullscreenControl: false,
      gestureHandling: 'greedy',
      renderingType: 'VECTOR',
      colorScheme,
      zoom: this.viewport.zoom,
    };

    if (this.styleTableBytes) {
      mapOptions.internalUsageAttributionIds = [
        'gmp_aistudio_stylingsandboxapplet_v1.0.0',
      ];
      mapOptions.styleTableBytes = this.styleTableBytes;
    }

    this.googleMap = new (window as any).google.maps.Map(mapElement, mapOptions);

    this.googleMap.addListener('bounds_changed', () => {
      const center = this.googleMap.getCenter();
      this.viewport.lat = center.lat();
      this.viewport.lng = center.lng();
      this.viewport.zoom = this.googleMap.getZoom();
    });

    this.placesService = new (window as any).google.maps.places.PlacesService(
      this.googleMap,
    );

    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(this.googleMap);
    } else {
      this.directionsRenderer =
        new (window as any).google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.googleMap);
    }

    if (!this.infoWindow) {
      this.infoWindow = new (window as any).google.maps.InfoWindow();
    }
  }

  private downloadJsonStyle() {
    if (!this.jsonStyle) {
      return;
    }
    try {
      const parsed = JSON.parse(this.jsonStyle);
      const prettyJson = JSON.stringify(parsed, null, 2);
      const blob = new Blob([prettyJson], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mapstyle.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      this.addMessage('error', 'Could not process the JSON style for download.');
      console.error('Error processing jsonStyle for download:', e);
      this.scrollToTheEnd();
    }
  }

  private getExportJsonStyleURL() {
    if (!this.jsonStyle) {
      return;
    }
    try {
      const condensed = JSON.stringify(JSON.parse(this.jsonStyle));
      const b64 = btoa(condensed);
      const url = `https://console.cloud.google.com/google/maps-apis/studio/styles/new/edit;stylesheet=${b64};source=AI_STUDIO_SANDBOX`;
      return url;
    } catch (e) {
      console.error('Error processing jsonStyle for export URL:', e);
    }
  }

  private exceedsBrowserUrlLimit(url: string) {
    // Optimizing for Chrome browser and other browsers with ~10k limit.
    // Some older browsers have e.g. 2k limit will be excluded.
    return url && url.length > 10000;
  }

  private exportJsonStyle() {
    if (!this.jsonStyle) {
      return;
    }
    const url = this.getExportJsonStyleURL();
    if (!url || this.exceedsBrowserUrlLimit(url)) {
      return;
    }
    window.open(url, '_blank');
  }

  private createMapId() {
    if (!this.jsonStyle) {
      return;
    }
    window.open(
      'https://console.cloud.google.com/google/maps-apis/studio/maps/quickCreate?source=AI_STUDIO',
      '_blank',
    );
  }

  private handleLocationQuery(location: string) {
    this.clearMapOverlays();
    this.geocoder.geocode(
      {address: location},
      (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          this.googleMap.setCenter(results[0].geometry.location);
          if (results[0].geometry.viewport) {
            this.googleMap.fitBounds(results[0].geometry.viewport);
          } else {
            this.googleMap.setZoom(15); // A reasonable zoom for a specific location without viewport
          }
        } else {
          console.error(
            `Geocode was not successful for "${location}": ${status}`,
          );
        }
      },
    );
  }

  private handleDirections(origin: string, destination: string) {
    this.clearMapOverlays();
    this.directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: (window as any).google.maps.TravelMode.DRIVING,
      },
      (response: any, status: any) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(response);
        } else {
          console.error(`Directions request failed: ${status}`);
        }
      },
    );
  }

  async showAboutDialog() {
    this.focusedElementBeforeDialog = document.activeElement as HTMLElement;
    this.isAboutDialogVisible = true;
    this.typed.stop();

    await this.updateComplete;

    const dialogButton = this.querySelector(
      '.intro-dialog button',
    ) as HTMLElement;
    dialogButton?.focus();
  }

  hideAboutDialog() {
    if (!this.isAboutDialogVisible) return;
    this.isAboutDialogVisible = false;
    this.typed.start();
    this.focusedElementBeforeDialog?.focus();
  }

  private handleDialogKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.hideAboutDialog();
      return;
    }

    if (e.key === 'Tab') {
      const dialog = e.currentTarget as HTMLElement;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ),
      ).filter((el) => el.offsetParent !== null);

      if (focusableElements.length <= 1) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }

  private handleSearch(search: string) {
    this.clearMapOverlays();
    const request = {
      query: search,
      fields: ['name', 'geometry', 'formatted_address', 'place_id'],
      locationBias: this.googleMap.getCenter(),
    };

    this.placesService.textSearch(request, (results: any, status: any) => {
      if (
        status === (window as any).google.maps.places.PlacesServiceStatus.OK &&
        results
      ) {
        const bounds = new (window as any).google.maps.LatLngBounds();

        results.forEach((place: any) => {
          if (!place.geometry || !place.geometry.location) {
            return;
          }

          const marker = new (window as any).google.maps.Marker({
            map: this.googleMap,
            title: place.name,
            position: place.geometry.location,
          });
          this.markers.push(marker);

          marker.addListener('click', () => {
            this.infoWindow.setContent(
              `<strong>${place.name}</strong><br>${place.formatted_address}`,
            );
            this.infoWindow.open(this.googleMap, marker);
          });

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });

        if (results.length > 0) {
          this.googleMap.fitBounds(bounds);
        }
      } else {
        console.error(`Places search failed: ${status}`);
      }
    });
  }

  setInputField(message: string) {
    this.inputMessage = message.trim();
  }

  addMessage(role: string, message: string, imageUrl?: string) {
    const div = document.createElement('div');
    div.classList.add('turn');
    div.classList.add(`role-${role.trim()}`);

    if (role === 'assistant') {
      render(ICON_SPARK, div);
      div.classList.add('executing');
    }

    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '200px';
      img.style.maxHeight = '200px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      img.style.marginBottom = message ? '8px' : '0';
      div.appendChild(img);
    }

    const thinking = document.createElement('div');
    thinking.classList.add('hidden');
    if (role === 'assistant') {
      thinking.classList.remove('hidden');
      thinking.classList.add('busy');
    }
    div.append(thinking);

    const textNode = document.createElement('div');
    textNode.className = 'text';
    textNode.textContent = message;
    div.append(textNode);

    this.messages.push(div);
    this.requestUpdate();
    setTimeout(() => this.scrollToTheEnd(), 0);

    return {thinking, textNode};
  }

  scrollToTheEnd() {
    if (!this.anchor) return;
    this.anchor.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }

  async sendMessageAction(message?: string, role?: string) {
    this.typed.stop();
    if (this.chatState !== ChatState.IDLE) return;

    this.chatState = ChatState.GENERATING;

    let msg = '';
    if (message) {
      msg = message.trim();
    } else {
      // get message and empty the field
      msg = this.inputMessage.trim();
      this.inputMessage = '';
    }

    const imageToSend = this.droppedImage;
    this.droppedImage = null; // Clear image after grabbing it for send

    if (msg.length === 0 && !imageToSend) {
      this.chatState = ChatState.IDLE;
      return;
    }

    const msgRole = role ? role.toLowerCase() : 'user';

    if (msgRole === 'user') {
      this.addMessage(msgRole, msg, imageToSend?.dataUrl);
    }

    if (this.sendMessageHandler) {
      await this.sendMessageHandler(
        msg,
        msgRole,
        imageToSend
          ? {mimeType: imageToSend.mimeType, data: imageToSend.data}
          : undefined,
      );
    }

    this.chatState = ChatState.IDLE;
  }

  private async inputKeyDownAction(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      this.sendMessageAction();
    }
  }

  hasGottenStarted(): boolean {
    return localStorage.getItem(LOCAL_STORAGE_GET_STARTED_KEY) === 'true';
  }

  getStarted(): void {
    localStorage.setItem(LOCAL_STORAGE_GET_STARTED_KEY, 'true');
    this.requestUpdate();
  }

  private renderAboutDialog() {
    return html`<div
      class="intro-dialog-container"
      @click=${this.hideAboutDialog}
      @keydown=${this.handleDialogKeyDown}>
      <div class="intro-dialog" @click=${(e: Event) => e.stopPropagation()}>
        <div class="intro-dialog__title">Using Maps Styling</div>
        <div class="intro-dialog__description">
          <p>
            To use a custom map style in your own application, follow these
            steps:
          </p>
          <ol>
            <li>
              <strong>Make sure you have a Google Cloud account.</strong>
              You can create one
              <a target="_blank" href="https://console.cloud.google.com/"
                >here</a
              >.
            </li>
            <li>
              <strong>Enable Cloud-based maps styling.</strong>
              Your styles are designed to work with Google Maps Platform's
              <a
                href="https://developers.google.com/maps/documentation/javascript/cloud-customization"
                target="_blank"
                >Cloud-based maps styling</a
              >
              which allows you to manage and update your map designs without
              changing your application code.
            </li>
            <li>
              <strong>Link your style to a map ID.</strong>
              In the Google Cloud Console, you need to link your customized
              style with a specific map ID. This ID serves as the identifier for
              your unique map design.
            </li>
            <li>
              <strong>Implement the map ID in your application.</strong>
              Once the style is linked to a map ID. This tells the Google Maps Platform what custom
              style to load for your map.
            </li>
          </ol>
          <p><strong>Helpful Links:</strong></p>
          <ul>
            <li>
              <a
                target="_blank"
                href="https://developers.google.com/maps/documentation/javascript/cloud-customization"
                >Cloud-based maps styling</a
              >
            </li>
            <li>
              <a
                target="_blank"
                href="https://developers.google.com/maps/documentation/javascript/map-ids/mapid-over#add-a-map-id-to-your-app"
                >Map ID Overview</a
              >
            </li>
            <li>
              <a
                target="_blank"
                href="https://developers.google.com/maps/documentation/javascript/cloud-customization/json"
                >Importing styles</a
              >
            </li>
            <li>
              <a
                target="_blank"
                href="https://developers.google.com/maps/documentation/javascript/cloud-customization/json-reference"
                >JSON styling reference</a
              >
            </li>
          </ul>
        </div>
        <div class="intro-dialog__footer">
          <button @click=${this.hideAboutDialog}>Got it</button>
        </div>
      </div>
    </div>`;
  }

  render() {
    return html`<div class="playground">
      ${this.hasGottenStarted()
        ? ''
        : html`<div class="intro-dialog-container">
            <div class="intro-dialog">
              <div class="intro-dialog__title">
                Welcome to Maps Styling!
              </div>
              <div class="intro-dialog__description">
                This interactive demo allows you to change the look and feel of
                Google Maps using natural language. Create a map style to match
                your brand, your mood, or the spirit of your favorite holiday. You can then import
                the style into the Maps Platform console to use in your
                applications. Learn more about
                <a
                  href="https://developers.google.com/maps/documentation/javascript/cloud-customization"
                  target="_blank"
                >
                  cloud-based maps styling.
                </a>
              </div>
              <div class="intro-dialog__description">To get started:</div>
              <div
                class="intro-dialog__description intro-dialog__description--list">
                ${html`<span class="icon-start">${ICON_START}</span>`} Enter a
                prompt or drag and drop an image to start styling
              </div>
              <div
                class="intro-dialog__description intro-dialog__description--list">
                ${html`<span class="icon-brush">${ICON_BRUSH_SPARK}</span>`}
                Refine your style with multi-turn communication
              </div>
              <div
                class="intro-dialog__description intro-dialog__description--list">
                ${html`<span class="icon-download">${ICON_DOWNLOAD}</span>`}
                Download the generated style or import directly into the Maps
                Platform console!
              </div>
              <div class="intro-dialog__footer">
                <button @click=${() => this.getStarted()}>Get started</button>
              </div>
            </div>
          </div>`}
      ${this.isAboutDialogVisible ? this.renderAboutDialog() : ''}
      <div class="sidebar">
        <div class="selector">
          <div class="sidebar-title">Maps Styling</div>
          <button
            id="infoButton"
            title="About Map Styling Sandbox"
            @click=${this.showAboutDialog}>
            ${ICON_INFO}
          </button>
        </div>
        <div id="chat">
          <div class="chat-messages">
            ${this.messages}
            <div id="anchor"></div>
          </div>

          <div class="footer">
            <div id="inputArea">
              ${this.droppedImage
                ? html` <div class="image-preview">
                    <img src=${this.droppedImage.dataUrl} alt="Image preview" />
                    <button
                      @click=${() => (this.droppedImage = null)}
                      title="Remove image">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="16px"
                        viewBox="0 -960 960 960"
                        width="16px"
                        fill="currentColor">
                        <path
                          d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                      </svg>
                    </button>
                  </div>`
                : ''}
              <div class="input-row">
                <textarea
                  type="text"
                  id="messageInput"
                  .value=${this.inputMessage}
                  @input=${(e: InputEvent) => {
                    this.inputMessage = (e.target as HTMLInputElement).value;
                  }}
                  @keydown=${(e: KeyboardEvent) => {
                    this.inputKeyDownAction(e);
                  }}
                  placeholder="${this.placeholderQuery}"
                  autocomplete="off"></textarea>
                <input
                  type="file"
                  id="imageUpload"
                  class="hidden"
                  accept="image/png, image/jpeg"
                  @change=${this.handleFileSelect} />
                <button
                  id="attachImageButton"
                  title="Attach image"
                  ?disabled=${this.chatState !== ChatState.IDLE}
                  class=${classMap({
                    disabled: this.chatState !== ChatState.IDLE
                  })}
                  @click=${() => this.imageUpload?.click()}>
                  ${ICON_ADD_PHOTO}
                </button>
                <button
                  id="sendButton"
                  ?disabled=${this.chatState !== ChatState.IDLE ||
                      (this.inputMessage === '' && !this.droppedImage)}
                  class=${classMap({
                    disabled:
                      this.chatState !== ChatState.IDLE ||
                      (this.inputMessage === '' && !this.droppedImage),
                  })}
                  @click=${() => {
                    this.sendMessageAction();
                  }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="30px"
                    viewBox="0 -960 960 960"
                    width="30px"
                    fill="currentColor">
                    <path
                      d="M120-160v-240l320-80-320-80v-240l760 320-760 320Z" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="chat-toolbar">
              <button
                @click=${this.exportJsonStyle}
                ?disabled=${!this.jsonStyle ||
                    this.exceedsBrowserUrlLimit(this.getExportJsonStyleURL())}
                class=${classMap({
                  disabled:
                    !this.jsonStyle ||
                    this.exceedsBrowserUrlLimit(this.getExportJsonStyleURL()),
                })}
                title=${
                  this.exceedsBrowserUrlLimit(this.getExportJsonStyleURL())
                    ? 'Style URL too large'
                    : 'Open in style editor'
                }>
                Open in style editor
              </button>
              <button
                @click=${this.createMapId}
                ?disabled=${!this.jsonStyle}
                class=${classMap({disabled: !this.jsonStyle})}
                title="Create a map ID">
                Create map ID
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="main-container">
        ${this.initMap} ${this.map}
      </div>
    </div>`;
  }
}
