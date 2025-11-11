import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { useNavigate } from 'react-router-dom';
import { FileText, Play, Users, ListTodo, Eye } from 'lucide-react';
import TemplatePreviewModal from '../components/TemplatePreviewModal';
import { getTemplateSample, hasSampleData } from '../config/templateSamples';

export default function Templates() {
  const templates = useWorkflowStore((state) => state.templates);
  const createWorkflowFromTemplate = useWorkflowStore(
    (state) => state.createWorkflowFromTemplate
  );
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const categories = ['all', ...new Set(templates.map((t) => t.category))];
  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = (templateId: string) => {
    const templateName = templates.find((t) => t.id === templateId)?.name;
    const workflowName = prompt(
      'Enter a name for your workflow:',
      templateName ? `My ${templateName}` : 'New Workflow'
    );

    if (workflowName) {
      createWorkflowFromTemplate(templateId, workflowName);
      navigate('/workflows');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workflow Templates</h1>
        <p className="text-gray-600 mt-1">
          Start quickly with pre-configured workflow templates
        </p>
      </div>

      {/* Category Filter */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No templates available</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <FileText className="h-5 w-5 text-primary-600" />
                      <h3 className="font-bold text-gray-900">{template.name}</h3>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {template.category}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {template.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ListTodo className="h-4 w-4" />
                  <span>{template.tasks.length} tasks</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{template.agents.length} agents</span>
                </div>
              </div>

              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Template Details */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                    View Details
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Agents:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {template.agents.map((agent, idx) => (
                          <li key={idx}>
                            {agent.name} ({agent.role})
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Tasks:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {template.tasks.map((task, idx) => (
                          <li key={idx}>{task.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {hasSampleData(template.id) && (
                  <button
                    onClick={() => setPreviewTemplate(template.id)}
                    className="flex-1 px-4 py-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </button>
                )}
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  className={`px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                    hasSampleData(template.id) ? 'flex-1' : 'w-full'
                  }`}
                >
                  <Play className="h-4 w-4" />
                  <span>Use Template</span>
                </button>
              </div>
            </div>
          ))}
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">About Templates</h3>
        <p className="text-sm text-blue-800">
          Templates provide pre-configured workflows with agents and tasks already set up.
          When you use a template, a new workflow is created based on the template configuration.
          You can then customize it to fit your specific needs.
        </p>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (() => {
        const template = templates.find(t => t.id === previewTemplate);
        const sample = getTemplateSample(previewTemplate);
        if (!template || !sample) return null;
        
        return (
          <TemplatePreviewModal
            template={template}
            sample={sample}
            isOpen={true}
            onClose={() => setPreviewTemplate(null)}
            onUseTemplate={() => {
              setPreviewTemplate(null);
              handleUseTemplate(previewTemplate);
            }}
          />
        );
      })()}
    </div>
  );
}
