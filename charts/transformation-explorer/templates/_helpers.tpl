{{- define "transformation-explorer.name" -}}transformation-explorer{{- end }}
{{- define "transformation-explorer.namespace" -}}{{ .Values.namespace.name }}{{- end }}
{{- define "transformation-explorer.labels" -}}
app.kubernetes.io/name: {{ include "transformation-explorer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | quote }}
{{- end }}
{{- define "transformation-explorer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "transformation-explorer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
{{- define "transformation-explorer.securityContext" -}}
allowPrivilegeEscalation: false
capabilities:
  drop: ["ALL"]
readOnlyRootFilesystem: true
runAsNonRoot: true
seccompProfile:
  type: RuntimeDefault
{{- end }}
